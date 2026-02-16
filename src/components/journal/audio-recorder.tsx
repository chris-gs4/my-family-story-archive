"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import { isNativePlatform, base64ToBlob } from "@/lib/capacitor"

type RecorderState = "idle" | "recording" | "fading" | "error"

interface AudioRecorderProps {
  projectId: string
  prompt: string
  ghostText: string
  onEntrySubmitted: () => void
  onError?: (error: string) => void
}

// Boilerplate text that types out DURING recording — the signature visual
const BOILERPLATE = `I remember sitting in my grandmother's kitchen, watching her bake apple pie. The warm smell of cinnamon filled the whole house, and she would let me help roll out the dough. Those afternoons felt like they could last forever, just the two of us in that warm little kitchen with flour on our hands and love in the air.`

export function AudioRecorder({
  projectId,
  prompt,
  ghostText,
  onEntrySubmitted,
  onError,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [isFadingText, setIsFadingText] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)
  const entryDataRef = useRef<{ entryId: string; uploadUrl: string } | null>(null)

  const isNative = isNativePlatform()

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(1, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  // Typewriter — runs DURING recording
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

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (typewriterRef.current) clearInterval(typewriterRef.current)
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Upload and trigger processing — entirely in background, user never sees this
  const submitEntryInBackground = useCallback(
    async (audioBlob: Blob, entryId: string, uploadUrl: string, duration: number, contentType: string) => {
      try {
        // Upload to S3 (skip in mock mode)
        if (!uploadUrl.includes("mock")) {
          await fetch(uploadUrl, {
            method: "PUT",
            body: audioBlob,
            headers: { "Content-Type": contentType },
          })
        }

        // Mark as uploaded → triggers processing pipeline
        await fetch(`/api/journal/entries/${entryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "UPLOADED", duration }),
        })

        console.log(`[Recorder] Entry ${entryId} submitted for background processing`)
      } catch (err) {
        console.error("[Recorder] Background submit failed:", err)
      }
    },
    []
  )

  // Haptic feedback for native platforms
  const triggerHaptic = useCallback(async () => {
    if (!isNative) return
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch {
      // Haptics not available — no-op
    }
  }, [isNative])

  // Handle recording completion (shared between native and web)
  const handleRecordingComplete = useCallback(
    (audioBlob: Blob, mimeType: string, duration: number) => {
      // Fade out the boilerplate text
      setIsFadingText(true)

      // Fire-and-forget: submit in background
      if (entryDataRef.current) {
        submitEntryInBackground(
          audioBlob,
          entryDataRef.current.entryId,
          entryDataRef.current.uploadUrl,
          duration,
          mimeType
        )
      }

      // After fade animation completes, show next question immediately
      setTimeout(() => {
        setIsFadingText(false)
        setTypedText("")
        setState("idle")
        setElapsed(0)
        onEntrySubmitted()
      }, 1500)
    },
    [submitEntryInBackground, onEntrySubmitted]
  )

  // --- Native recording (Capacitor) ---
  const startNativeRecording = async () => {
    try {
      const { VoiceRecorder } = await import("capacitor-voice-recorder")

      // Request permissions
      const permResult = await VoiceRecorder.requestAudioRecordingPermission()
      if (!permResult.value) {
        throw new Error("Microphone permission denied")
      }

      // Create entry record upfront to get presigned URL
      const res = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, promptText: prompt }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create entry")
      }

      const { data } = await res.json()
      entryDataRef.current = { entryId: data.entry.id, uploadUrl: data.uploadUrl }

      // Start native recording
      await VoiceRecorder.startRecording()
      await triggerHaptic()

      setState("recording")
      setElapsed(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)

      // Start typewriter
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
      console.error("[Recorder] Native stop failed:", err)
      setState("error")
      setErrorMessage("Recording failed. Please try again.")
    }
  }

  // --- Web recording (MediaRecorder) ---
  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create entry record upfront to get presigned URL
      const res = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, promptText: prompt }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create entry")
      }

      const { data } = await res.json()
      entryDataRef.current = { entryId: data.entry.id, uploadUrl: data.uploadUrl }

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
        const duration = elapsed

        handleRecordingComplete(audioBlob, "audio/webm", duration)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)

      setState("recording")
      setElapsed(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)

      // Start typewriter (boilerplate text appears while recording)
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    setState("fading")
  }

  // --- Unified handlers ---
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
    <div className="flex flex-col h-full">
      {/* Question */}
      <div className="flex-shrink-0 text-center px-4 pt-8 pb-4">
        <h2 className="text-xl font-bold text-journal-text leading-snug">
          {prompt}
        </h2>
      </div>

      {/* Middle area: ghost text + boilerplate typewriter */}
      <div className="flex-1 px-6 py-4 relative overflow-hidden">
        {/* Ghost text from previous answer — always faintly visible */}
        {ghostText && (
          <p className="text-base font-caveat text-journal-text/10 leading-relaxed italic">
            {ghostText}
          </p>
        )}

        {/* Boilerplate typewriter text — appears DURING recording */}
        {(state === "recording" || state === "fading") && typedText && (
          <p
            className={`text-lg font-caveat text-journal-text/60 leading-relaxed italic absolute inset-x-6 top-4 transition-opacity duration-1000 ${
              isFadingText ? "opacity-0" : "opacity-100"
            }`}
          >
            {typedText}
            {!isFadingText && (
              <span className="inline-block w-[2px] h-[1em] bg-journal-text/30 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        )}
      </div>

      {/* Bottom: mic button + label */}
      <div className="flex-shrink-0 flex flex-col items-center pb-10 pt-2">
        {/* Recording timer label */}
        {state === "recording" && (
          <p className="text-sm text-red-500 font-medium mb-3">
            Recording {formatTime(elapsed)}
          </p>
        )}

        {/* "Writing your story..." label during fade */}
        {state === "fading" && (
          <p className="text-sm text-journal-text-secondary mb-3">
            Writing your story...
          </p>
        )}

        {/* Mic / Stop button */}
        {state === "recording" ? (
          <div className="relative">
            {/* Pink pulse ring */}
            <div className="absolute -inset-3 rounded-full bg-red-200/50 animate-pulse" />
            <button
              onClick={stopRecording}
              className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center
                active:scale-95 transition-transform duration-150
                focus:outline-none"
              aria-label="Stop recording"
            >
              <Square className="w-5 h-5 text-white fill-white" />
            </button>
          </div>
        ) : state === "fading" ? (
          <div className="w-16 h-16 rounded-full bg-journal-text/80 flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            <button
              onClick={reset}
              className="text-sm text-journal-text underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          /* Idle state */
          <>
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-journal-text flex items-center justify-center
                hover:bg-black active:scale-95 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-journal-text/20"
              aria-label="Start recording"
            >
              <Mic className="w-6 h-6 text-white" />
            </button>
            <p className="text-sm text-journal-text-secondary mt-3">
              Tap to speak your answer
            </p>
          </>
        )}
      </div>
    </div>
  )
}
