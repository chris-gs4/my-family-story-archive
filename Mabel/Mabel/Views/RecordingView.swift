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
    @State private var showWriteBox = false
    @State private var typedEntry = ""

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
            // Top bar with back button
            HStack {
                Button(action: { dismiss() }) {
                    HStack(spacing: MabelSpacing.tightGap) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                        MabelWordmarkLockup()
                    }
                    .foregroundColor(.mabelPrimary)
                    .frame(height: 44)
                    .contentShape(Rectangle())
                }
                Spacer()
            }
            .padding(.top, MabelSpacing.tightGap)
            .padding(.bottom, MabelSpacing.xs)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // Chapter badge + progress bar
                    VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                        HStack(spacing: MabelSpacing.tightGap) {
                            Text("CH. \(chapter.id)")
                                .font(MabelTypography.badge())
                                .foregroundColor(.mabelPrimary)
                                .padding(.horizontal, MabelSpacing.md)
                                .padding(.vertical, MabelSpacing.xs)
                                .background(
                                    Capsule().fill(Color.mabelPrimaryLight)
                                )

                            Text(chapter.title)
                                .subheadingStyle()

                            Spacer()

                            Text("\(chapter.completedMemoryCount)/\(Chapter.memoriesPerChapter)")
                                .font(MabelTypography.badge())
                                .foregroundColor(.mabelPrimary)
                        }

                        ProgressBar(
                            progress: Double(chapter.completedMemoryCount) / Double(Chapter.memoriesPerChapter),
                            height: 6
                        )
                    }
                    .padding(.top, MabelSpacing.sectionGap)
                    .padding(.bottom, MabelSpacing.xl)

                    // Prompt if selected
                    if let prompt = prompt {
                        Text(prompt)
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                            .multilineTextAlignment(.center)
                            .padding(.bottom, MabelSpacing.sectionGap)
                    }

                    // CENTER MIC BUTTON — 100pt per Fitts's Law
                    Button(action: toggleRecording) {
                        ZStack {
                            if isActivelyRecording {
                                Circle()
                                    .fill(Color.mabelBurgundy.opacity(0.12))
                                    .frame(width: 140, height: 140)
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
                                    .frame(width: 140, height: 140)
                            }

                            Circle()
                                .fill(micColor)
                                .frame(width: 100, height: 100)
                                .shadow(color: micColor.opacity(0.3), radius: 12, x: 0, y: 4)

                            Image(systemName: "mic.fill")
                                .font(.system(size: 36))
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.bottom, MabelSpacing.xl)

                    // Waveform
                    WaveformView(
                        isAnimating: isActivelyRecording,
                        barCount: 24,
                        tintColor: isActivelyRecording ? .mabelBurgundy : .mabelSubtle.opacity(0.4)
                    )
                    .padding(.horizontal, MabelSpacing.xxxl)
                    .padding(.bottom, MabelSpacing.elementGap)

                    // Timer
                    Text(formattedTime)
                        .font(MabelTypography.timer())
                        .foregroundColor(.mabelText)
                        .monospacedDigit()
                        .padding(.bottom, MabelSpacing.xs)

                    // Status indicator
                    HStack(spacing: 6) {
                        if isActivelyRecording {
                            Circle()
                                .fill(Color.mabelBurgundy)
                                .frame(width: 8, height: 8)
                        }
                        Text(statusText)
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                    }
                    .padding(.bottom, MabelSpacing.xl)

                    // Typewriter text
                    Text(isActivelyRecording ? typewriterText : "")
                        .font(MabelTypography.helper())
                        .foregroundColor(.mabelSubtle)
                        .multilineTextAlignment(.center)
                        .frame(height: 20)
                        .padding(.bottom, MabelSpacing.elementGap)

                    // Controls card — figure-ground separation
                    VStack(spacing: MabelSpacing.md) {
                        // Button trio
                        HStack(spacing: MabelSpacing.md) {
                            // Clear — destructive
                            Button(action: clearRecording) {
                                Text("Clear")
                                    .font(MabelTypography.badge())
                                    .foregroundColor(.mabelBurgundy)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(
                                        Capsule()
                                            .strokeBorder(Color.mabelBurgundy.opacity(0.5), lineWidth: MabelSpacing.borderCard)
                                    )
                            }

                            // Pause/Resume — secondary
                            Button(action: toggleRecording) {
                                Text(recorder.isRecording ? "Pause" : (hasStartedOnce ? "Resume" : "Record"))
                                    .font(MabelTypography.badge())
                                    .foregroundColor(.mabelPrimary)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(
                                        Capsule()
                                            .strokeBorder(Color.mabelPrimary, lineWidth: MabelSpacing.borderCard)
                                    )
                            }

                            // Stop & Save — filled primary
                            Button(action: saveMemory) {
                                Text("Stop & Save")
                                    .font(MabelTypography.badge())
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(
                                        Capsule()
                                            .fill(hasStartedOnce && !isProcessing ? Color.mabelPrimary : Color.mabelSubtle.opacity(0.4))
                                    )
                            }
                            .disabled(!hasStartedOnce || isProcessing)
                        }

                        // Write instead — icon circle card row
                        Button(action: { showWriteBox.toggle() }) {
                            HStack(spacing: MabelSpacing.md) {
                                Image(systemName: "pencil.line")
                                    .font(.system(size: 16))
                                    .foregroundColor(.mabelPrimary)
                                    .frame(width: 36, height: 36)
                                    .background(Circle().fill(Color.mabelPrimaryLight))

                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Write instead")
                                        .font(MabelTypography.helper())
                                        .foregroundColor(.mabelText)
                                    Text("Type your memory if you prefer")
                                        .font(MabelTypography.smallLabel())
                                        .foregroundColor(.mabelSubtle)
                                }
                                Spacer()
                                Image(systemName: showWriteBox ? "chevron.down" : "chevron.right")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.mabelSubtle)
                            }
                        }

                        if showWriteBox {
                            TextEditor(text: $typedEntry)
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelText)
                                .scrollContentBackground(.hidden)
                                .padding(MabelSpacing.md)
                                .frame(minHeight: 120)
                                .background(
                                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                        .fill(Color.mabelBackgroundAlt)
                                )

                            if !typedEntry.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                                CTAButton(title: "SAVE WRITTEN MEMORY") {
                                    saveTypedMemory()
                                }
                            }
                        }
                    }
                    .cardPadding()
                    .background(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusCard)
                            .fill(Color.mabelSurface)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusCard)
                            .strokeBorder(Color.mabelBorderWarm, lineWidth: MabelSpacing.borderCard)
                    )
                    .mabelCardShadow()

                    Spacer()
                        .frame(height: MabelSpacing.bottomSafe * 2)
                }
            }
        }
        .screenPadding()
        .background(
            Color.mabelBackground
                .ignoresSafeArea(.all, edges: .all)
        )
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

    private func saveTypedMemory() {
        let trimmed = typedEntry.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let memory = Memory(
            promptUsed: prompt,
            state: .submitted,
            typedEntry: trimmed,
            createdAt: Date()
        )
        appState.addMemory(chapterIndex: chapterIndex, memory: memory)

        let memoryID = memory.id
        Task {
            await StoryProcessingService.shared.processTypedMemory(
                memoryID: memoryID,
                chapterIndex: chapterIndex,
                text: trimmed,
                chapter: chapter,
                userName: appState.userProfile?.displayName ?? "Narrator",
                appState: appState
            )
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
