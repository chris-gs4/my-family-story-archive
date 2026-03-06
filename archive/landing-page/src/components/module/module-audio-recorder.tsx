"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import { isNativePlatform, base64ToBlob } from "@/lib/capacitor"

type RecorderState = "idle" | "recording" | "fading" | "error"

interface ModuleAudioRecorderProps {
  projectId: string
  moduleId: string
  questionId: string
  prompt: string
  onRecordingComplete: () => void
  onError?: (error: string) => void
}

const BOILERPLATE = `I remember sitting in my grandmother's kitchen, watching her bake apple pie. The warm smell of cinnamon filled the whole house, and she would let me help roll out the dough. Those afternoons felt like they could last forever, just the two of us in that warm little kitchen with flour on our hands and love in the air.`

export function ModuleAudioRecorder({
  projectId,
  moduleId,
  questionId,
  prompt,
  onRecordingComplete,
  onError,
}: ModuleAudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [isFadingText, setIsFadingText] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)
  const uploadDataRef = useRef<{ uploadUrl: string; fileKey: string } | null>(null)
  const elapsedRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const levelAnimRef = useRef<number | null>(null)

  const isNative = isNativePlatform()

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(1, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const startTypewriter = useCallback(() => {
    let charIndex = 0
    setTypedText("")

    typewriterRef.current = setInterval(() => {
      charIndex++
      setTypedText(BOILERPLATE.slice(0, charIndex))
      if (charIndex >= BOILERPLATE.length) {
        if (typewriterRef.current) clearInterval(typewriterRef.current)
      }
    }, 40)
  }, [])

  const startAudioLevelMonitor = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.5
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        analyser.getByteFrequencyData(dataArray)
        const sum = dataArray.reduce((a, b) => a + b, 0)
        const avg = sum / dataArray.length / 255
        setAudioLevel(avg)
        levelAnimRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      // AudioContext not available
    }
  }, [])

  const stopAudioLevelMonitor = useCallback(() => {
    if (levelAnimRef.current) cancelAnimationFrame(levelAnimRef.current)
    levelAnimRef.current = null
    audioContextRef.current?.close()
    audioContextRef.current = null
    analyserRef.current = null
    setAudioLevel(0)
  }, [])

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (typewriterRef.current) clearInterval(typewriterRef.current)
    stopAudioLevelMonitor()
  }, [stopAudioLevelMonitor])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const triggerHaptic = useCallback(async () => {
    if (!isNative) return
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch {
      // Haptics not available
    }
  }, [isNative])

  // Upload and notify completion
  const submitInBackground = useCallback(
    async (audioBlob: Blob, uploadUrl: string, duration: number, contentType: string) => {
      try {
        // Upload to S3 (skip in mock mode)
        if (!uploadUrl.includes("mock")) {
          await fetch(uploadUrl, {
            method: "PUT",
            body: audioBlob,
            headers: { "Content-Type": contentType },
          })
        }

        // Tell API upload is complete -> triggers processing
        await fetch(
          `/api/projects/${projectId}/modules/${moduleId}/questions/${questionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "upload-complete", duration }),
          }
        )

        console.log(`[ModuleRecorder] Question ${questionId} submitted for processing`)
      } catch (err) {
        console.error("[ModuleRecorder] Background submit failed:", err)
      }
    },
    [projectId, moduleId, questionId]
  )

  const handleRecordingComplete = useCallback(
    (audioBlob: Blob, mimeType: string, duration: number) => {
      setIsFadingText(true)

      if (uploadDataRef.current) {
        submitInBackground(audioBlob, uploadDataRef.current.uploadUrl, duration, mimeType)
      }

      setTimeout(() => {
        setIsFadingText(false)
        setTypedText("")
        setState("idle")
        setElapsed(0)
        onRecordingComplete()
      }, 1500)
    },
    [submitInBackground, onRecordingComplete]
  )

  // Get presigned URL from module question API
  const getUploadUrl = async (audioFormat: "aac" | "webm") => {
    const res = await fetch(
      `/api/projects/${projectId}/modules/${moduleId}/questions/${questionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-recording", audioFormat }),
      }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to start recording")
    }

    const { data } = await res.json()
    return data as { uploadUrl: string; fileKey: string }
  }

  // --- Native recording (Capacitor) ---
  const startNativeRecording = async () => {
    try {
      const { VoiceRecorder } = await import("capacitor-voice-recorder")

      const permResult = await VoiceRecorder.requestAudioRecordingPermission()
      if (!permResult.value) {
        throw new Error("Microphone permission denied")
      }

      const uploadData = await getUploadUrl("aac")
      uploadDataRef.current = uploadData

      await VoiceRecorder.startRecording()
      await triggerHaptic()

      setState("recording")
      setElapsed(0)
      elapsedRef.current = 0

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          elapsedRef.current = next
          return next
        })
      }, 1000)

      startTypewriter()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied"
      setState("error")
      setErrorMessage(msg)
      onError?.(msg)
    }
  }

  const stopNativeRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }

    setState("fading")
    await triggerHaptic()

    try {
      const { VoiceRecorder } = await import("capacitor-voice-recorder")
      const result = await VoiceRecorder.stopRecording()

      const mimeType = result.value.mimeType ?? "audio/aac"
      const durationSec = Math.round(result.value.msDuration / 1000)
      const base64Data = result.value.recordDataBase64
      if (!base64Data) {
        throw new Error("No audio data received from recorder")
      }
      const audioBlob = base64ToBlob(base64Data, mimeType)

      handleRecordingComplete(audioBlob, mimeType, durationSec)
    } catch (err) {
      console.error("[ModuleRecorder] Native stop failed:", err)
      setState("error")
      setErrorMessage("Recording failed. Please try again.")
    }
  }

  // --- Web recording (MediaRecorder) ---
  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const uploadData = await getUploadUrl("webm")
      uploadDataRef.current = uploadData

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      })

      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        const duration = elapsedRef.current
        handleRecordingComplete(audioBlob, "audio/webm", duration)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)

      setState("recording")
      setElapsed(0)
      elapsedRef.current = 0

      startAudioLevelMonitor(stream)

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          elapsedRef.current = next
          return next
        })
      }, 1000)

      startTypewriter()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied"
      setState("error")
      setErrorMessage(msg)
      onError?.(msg)
    }
  }

  const stopWebRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
    stopAudioLevelMonitor()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setState("fading")
  }

  const startRecording = isNative ? startNativeRecording : startWebRecording
  const stopRecording = isNative ? stopNativeRecording : stopWebRecording

  const reset = () => {
    cleanup()
    setState("idle")
    setElapsed(0)
    setErrorMessage("")
    setTypedText("")
    setIsFadingText(false)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Typewriter text during recording */}
      {(state === "recording" || state === "fading") && typedText && (
        <div className="w-full mb-6 px-4">
          <p
            className={`text-base italic leading-relaxed transition-opacity duration-1000 ${
              isFadingText ? "opacity-0" : "opacity-60"
            }`}
            style={{ fontFamily: "Georgia, serif", color: "#111827" }}
          >
            {typedText}
            {!isFadingText && (
              <span className="inline-block w-[2px] h-[1em] bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>
      )}

      {/* Mic button + label */}
      <div className="flex flex-col items-center">
        {state === "recording" && (
          <p className="text-sm text-red-500 font-medium mb-3">
            Recording {formatTime(elapsed)}
          </p>
        )}

        {state === "fading" && (
          <p className="text-sm text-gray-500 mb-3">
            Writing your story...
          </p>
        )}

        {state === "recording" ? (
          <div className="relative">
            <div
              className="absolute rounded-full bg-red-300/40 transition-all duration-100 ease-out"
              style={{
                inset: `-${14 + audioLevel * 40}px`,
                opacity: 0.2 + audioLevel * 0.6,
              }}
            />
            <div
              className="absolute rounded-full bg-red-200/30 transition-all duration-150 ease-out"
              style={{
                inset: `-${8 + audioLevel * 24}px`,
              }}
            />
            <button
              onClick={stopRecording}
              className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center active:scale-95 transition-transform duration-150 focus:outline-none"
              aria-label="Stop recording"
            >
              <Square className="w-5 h-5 text-white fill-white" />
            </button>
          </div>
        ) : state === "fading" ? (
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            <button
              onClick={reset}
              className="text-sm text-gray-700 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-200"
              style={{ backgroundColor: "#2F6F5E" }}
              aria-label="Start recording"
            >
              <Mic className="w-6 h-6 text-white" />
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Tap to speak your answer
            </p>
          </>
        )}
      </div>
    </div>
  )
}
