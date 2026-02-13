"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, Square, Loader2 } from "lucide-react"

type RecorderState = "idle" | "recording" | "uploading" | "processing" | "done" | "error"

interface AudioRecorderProps {
  projectId: string
  promptText?: string
  onComplete: () => void
  onError?: (error: string) => void
}

const BOILERPLATE_PHRASES = [
  "Transforming your words into prose...",
  "Finding the heart of your story...",
  "Polishing your narrative...",
  "Crafting your memoir entry...",
  "Weaving your memories together...",
]

export function AudioRecorder({ projectId, promptText, onComplete, onError }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [animationText, setAnimationText] = useState("")
  const [entryId, setEntryId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Format seconds as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  // Start boilerplate text animation
  const startAnimation = useCallback(() => {
    let index = 0
    setAnimationText(BOILERPLATE_PHRASES[0])
    animationTimerRef.current = setInterval(() => {
      index = (index + 1) % BOILERPLATE_PHRASES.length
      setAnimationText(BOILERPLATE_PHRASES[index])
    }, 3000)
  }, [])

  // Clean up all timers
  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationTimerRef.current) clearInterval(animationTimerRef.current)
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Poll for entry completion
  const pollForCompletion = useCallback((id: string) => {
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/journal/entries/${id}`)
        if (!res.ok) return

        const { data } = await res.json()
        if (data.status === "COMPLETE") {
          cleanup()
          setState("done")
          setTimeout(onComplete, 1500)
        } else if (data.status === "ERROR") {
          cleanup()
          setState("error")
          setErrorMessage(data.errorMessage || "Processing failed")
          onError?.(data.errorMessage || "Processing failed")
        }
      } catch {
        // Ignore poll errors, will retry
      }
    }, 2000)
  }, [cleanup, onComplete, onError])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create entry in backend to get upload URL
      const res = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, promptText }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create entry")
      }

      const { data } = await res.json()
      setEntryId(data.entry.id)

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      })

      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Upload
        setState("uploading")
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })

        try {
          // Upload to S3 via presigned URL
          await fetch(data.uploadUrl, {
            method: "PUT",
            body: audioBlob,
            headers: { "Content-Type": "audio/webm" },
          })

          // Mark as uploaded and trigger processing
          setState("processing")
          startAnimation()

          const uploadRes = await fetch(`/api/journal/entries/${data.entry.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "UPLOADED",
              duration: elapsed,
            }),
          })

          if (!uploadRes.ok) {
            throw new Error("Failed to trigger processing")
          }

          // Start polling for completion
          pollForCompletion(data.entry.id)
        } catch (err) {
          setState("error")
          const msg = err instanceof Error ? err.message : "Upload failed"
          setErrorMessage(msg)
          onError?.(msg)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second

      setState("recording")
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied"
      setState("error")
      setErrorMessage(msg)
      onError?.(msg)
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const reset = () => {
    cleanup()
    setState("idle")
    setElapsed(0)
    setEntryId(null)
    setErrorMessage("")
    setAnimationText("")
  }

  return (
    <div className="flex flex-col items-center">
      {/* Recording state */}
      {state === "idle" && (
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-journal-text flex items-center justify-center
              hover:bg-black active:scale-95 transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-journal-text/20"
            aria-label="Start recording"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
          <p className="text-sm text-journal-text-secondary">Tap to start recording</p>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-6">
          {/* Pulsing rings */}
          <div className="relative">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-500/20 animate-ping" />
            <div className="absolute -inset-3 w-26 h-26 rounded-full bg-red-500/10 animate-pulse" />
            <button
              onClick={stopRecording}
              className="relative w-20 h-20 rounded-full bg-red-500 flex items-center justify-center
                hover:bg-red-600 active:scale-95 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-red-500/20"
              aria-label="Stop recording"
            >
              <Square className="w-6 h-6 text-white fill-white" />
            </button>
          </div>

          {/* Timer */}
          <div className="text-2xl font-mono text-journal-text tabular-nums">
            {formatTime(elapsed)}
          </div>
          <p className="text-sm text-journal-text-secondary">Recording... tap to stop</p>
        </div>
      )}

      {state === "uploading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-journal-text/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-journal-text animate-spin" />
          </div>
          <p className="text-sm text-journal-text-secondary">Uploading...</p>
        </div>
      )}

      {state === "processing" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-journal-text/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-journal-text animate-spin" />
          </div>
          <p className="text-base text-journal-text font-medium text-center transition-opacity duration-500">
            {animationText}
          </p>
          <p className="text-xs text-journal-text-secondary">This usually takes about 15-20 seconds</p>
        </div>
      )}

      {state === "done" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base text-journal-text font-medium">Entry saved!</p>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-red-600 text-center">{errorMessage}</p>
          <button
            onClick={reset}
            className="text-sm text-journal-text underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
