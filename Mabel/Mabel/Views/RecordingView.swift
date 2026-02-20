import SwiftUI
import Combine

struct RecordingView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    let chapterIndex: Int
    let prompt: String?

    @State private var recorder = AudioRecorderService()
    @State private var hasStartedOnce = false
    @State private var typewriterText: String = ""
    @State private var micPulse = false
    @State private var isProcessing = false

    private let boilerplateLines = [
        "Mabel is listening...",
        "Capturing your words...",
        "Your story is being written..."
    ]

    private var chapter: Chapter {
        guard chapterIndex >= 0, chapterIndex < appState.chapters.count else {
            return Chapter.allChapters[0]
        }
        return appState.chapters[chapterIndex]
    }

    private var formattedTime: String {
        let minutes = recorder.elapsedSeconds / 60
        let seconds = recorder.elapsedSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    private var statusText: String {
        if recorder.isPaused { return "Paused" }
        if recorder.isRecording { return "Recording" }
        return "Tap to record"
    }

    private var micColor: Color {
        if recorder.isRecording { return .mabelBurgundy }
        if recorder.isPaused { return .mabelSubtle }
        return .mabelTeal
    }

    private var isActivelyRecording: Bool {
        recorder.isRecording && !recorder.isPaused
    }

    var body: some View {
        VStack(spacing: 0) {
                // Top bar with back button (below safe area)
                HStack {
                    Button(action: { dismiss() }) {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                            Text("Back")
                                .font(.comfortaa(14, weight: .medium))
                        }
                        .foregroundColor(.mabelTeal)
                        .frame(height: 44)
                        .contentShape(Rectangle())
                    }
                    Spacer()
                }
                .padding(.top, 8)
                .padding(.bottom, 4)

                // Chapter heading
                Text("Chapter \(chapter.id) – \(chapter.title)")
                    .font(.comfortaa(18, weight: .bold))
                    .foregroundColor(.mabelText)
                    .padding(.bottom, 4)

                Text("\(chapter.completedMemoryCount) of 5 memories recorded")
                    .font(.comfortaa(12, weight: .regular))
                    .foregroundColor(.mabelSubtle)
                    .padding(.bottom, 4)

                // Prompt if selected
                if let prompt = prompt {
                    Text(prompt)
                        .font(.comfortaa(14, weight: .medium))
                        .foregroundColor(.mabelText)
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                        .padding(.horizontal, 16)
                        .padding(.bottom, 4)
                }

                Spacer()

                // CENTER MIC BUTTON
                Button(action: toggleRecording) {
                    ZStack {
                        if isActivelyRecording {
                            Circle()
                                .fill(Color.mabelBurgundy.opacity(0.12))
                                .frame(width: 120, height: 120)
                                .scaleEffect(micPulse ? 1.25 : 1.0)
                                .opacity(micPulse ? 0.0 : 0.6)
                                .animation(
                                    .easeOut(duration: 1.5).repeatForever(autoreverses: false),
                                    value: micPulse
                                )
                        }

                        if !isActivelyRecording {
                            Circle()
                                .fill(micColor.opacity(0.08))
                                .frame(width: 112, height: 112)
                        }

                        Circle()
                            .fill(micColor)
                            .frame(width: 88, height: 88)
                            .shadow(color: micColor.opacity(0.3), radius: 10, x: 0, y: 4)

                        Image(systemName: "mic.fill")
                            .font(.system(size: 34))
                            .foregroundColor(.white)
                    }
                }
                .padding(.bottom, 24)

                // Waveform
                WaveformView(
                    isAnimating: isActivelyRecording,
                    barCount: 24,
                    tintColor: isActivelyRecording ? .mabelBurgundy : .mabelSubtle.opacity(0.4)
                )
                .padding(.horizontal, 40)
                .padding(.bottom, 20)

                // Timer
                Text(formattedTime)
                    .font(.comfortaa(24, weight: .medium))
                    .foregroundColor(.mabelText)
                    .monospacedDigit()
                    .padding(.bottom, 4)

                // Status indicator
                HStack(spacing: 6) {
                    if isActivelyRecording {
                        Circle()
                            .fill(Color.mabelBurgundy)
                            .frame(width: 8, height: 8)
                    }
                    Text(statusText)
                        .font(.comfortaa(14, weight: .medium))
                        .foregroundColor(.mabelSubtle)
                }
                .padding(.bottom, 16)

                // Typewriter text
                Text(isActivelyRecording ? typewriterText : "")
                    .font(.comfortaa(14, weight: .regular))
                    .foregroundColor(.mabelSubtle)
                    .multilineTextAlignment(.center)
                    .frame(height: 20)
                    .padding(.bottom, 8)

                Spacer()

                // BOTTOM CONTROLS
                HStack(spacing: 12) {
                    // Clear
                    Button(action: clearRecording) {
                        Text("Clear")
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelBurgundy)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .strokeBorder(Color.mabelBurgundy.opacity(0.3), lineWidth: 1.5)
                            )
                    }

                    // Pause/Resume
                    Button(action: toggleRecording) {
                        Text(recorder.isRecording ? "Pause" : (hasStartedOnce ? "Resume" : "Record"))
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelTeal)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
                            )
                    }

                    // Stop & Save
                    Button(action: saveMemory) {
                        Text("Stop & Save")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .fill(hasStartedOnce && !isProcessing ? Color.mabelTeal : Color.mabelSubtle.opacity(0.4))
                            )
                    }
                    .disabled(!hasStartedOnce || isProcessing)
                }
                .padding(.bottom, 16)

                // SAVE MEMORY CTA
                CTAButton(
                    title: isProcessing ? "SAVING..." : "SAVE MEMORY",
                    isDisabled: !hasStartedOnce || isProcessing
                ) {
                    saveMemory()
                }
                .padding(.bottom, 40)
        }
        .padding(.horizontal, 24)
        .background(MabelGradientBackground())
        .toolbar(.hidden, for: .navigationBar)
        .onDisappear {
            if recorder.isRecording || recorder.isPaused {
                recorder.cancelRecording()
            }
        }
        .task {
            if !recorder.hasPermission {
                _ = await recorder.requestPermission()
            }
        }
    }

    // MARK: - Actions

    private func toggleRecording() {
        if recorder.isRecording {
            recorder.pauseRecording()
            micPulse = false
        } else {
            if hasStartedOnce {
                recorder.resumeRecording()
            } else {
                recorder.startRecording()
                hasStartedOnce = true
            }
            micPulse = true
            startTypewriterEffect()
        }
    }

    private func clearRecording() {
        recorder.cancelRecording()
        recorder.reset()
        hasStartedOnce = false
        micPulse = false
        typewriterText = ""
    }

    private func saveMemory() {
        isProcessing = true

        // Stop recording and get the file
        let result = recorder.stopRecording()

        let memory = Memory(
            promptUsed: prompt,
            audioFileName: result?.fileName,
            state: .submitted,
            duration: TimeInterval(recorder.elapsedSeconds),
            createdAt: Date()
        )

        appState.addMemory(chapterIndex: chapterIndex, memory: memory)

        // Start async processing if we have an audio file
        if let audioURL = result?.url {
            let memoryID = memory.id
            Task {
                await StoryProcessingService.shared.processMemory(
                    memoryID: memoryID,
                    chapterIndex: chapterIndex,
                    audioURL: audioURL,
                    chapter: chapter,
                    userName: appState.userProfile?.displayName ?? "Narrator",
                    appState: appState
                )
            }
        }

        dismiss()
    }

    private func startTypewriterEffect() {
        let line = boilerplateLines[Int.random(in: 0..<boilerplateLines.count)]
        typewriterText = ""
        var charIndex = 0
        func appendNext() {
            guard charIndex < line.count else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    if recorder.isRecording && !recorder.isPaused {
                        startTypewriterEffect()
                    }
                }
                return
            }
            let index = line.index(line.startIndex, offsetBy: charIndex)
            typewriterText.append(line[index])
            charIndex += 1
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                if recorder.isRecording && !recorder.isPaused {
                    appendNext()
                }
            }
        }
        appendNext()
    }
}

#Preview {
    NavigationStack {
        RecordingView(
            chapterIndex: 0,
            prompt: "What are your favorite family traditions?"
        )
        .environment(AppState())
    }
}
