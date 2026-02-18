import SwiftUI
import Combine

struct RecordingView: View {
    let prompt: String?
    let onSave: () -> Void
    let onClear: () -> Void

    // Recording starts IDLE — user must tap the mic to begin
    @State private var isRecording = false
    @State private var isPaused = false
    @State private var hasStartedOnce = false
    @State private var elapsedSeconds: Int = 0
    @State private var timer: AnyCancellable?
    @State private var typewriterText: String = ""
    @State private var micPulse = false

    private let boilerplateLines = [
        "Mabel is listening...",
        "Capturing your words...",
        "Your story is being written..."
    ]

    private var formattedTime: String {
        let minutes = elapsedSeconds / 60
        let seconds = elapsedSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    private var statusText: String {
        if isPaused { return "Paused" }
        if isRecording { return "Recording" }
        return "Tap to record"
    }

    /// Mic color: teal when idle, burgundy when recording, subtle when paused
    private var micColor: Color {
        if isRecording { return .mabelBurgundy }
        if isPaused { return .mabelSubtle }
        return .mabelTeal
    }

    /// Whether waveform should animate — only when actively recording
    private var isActivelyRecording: Bool {
        isRecording && !isPaused
    }

    var body: some View {
        ZStack {
            // BACKGROUND — fills entire screen
            MabelGradientBackground()

            // CONTENT
            VStack(spacing: 0) {
                // Prompt header at top
                if let prompt = prompt {
                    Text(prompt)
                        .font(.comfortaa(20, weight: .bold))
                        .foregroundColor(.mabelText)
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                        .padding(.bottom, 4)

                    Text("Selected prompt")
                        .font(.comfortaa(12, weight: .regular))
                        .foregroundColor(.mabelSubtle)
                        .padding(.bottom, 24)
                } else {
                    Text("Free Recording")
                        .font(.comfortaa(20, weight: .bold))
                        .foregroundColor(.mabelText)
                        .padding(.top, 16)
                        .padding(.bottom, 24)
                }

                Spacer()

                // CENTER MIC BUTTON — tappable to start/pause/resume recording
                Button(action: toggleRecording) {
                    ZStack {
                        // Outer pulse glow when actively recording
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

                        // Static outer ring when idle or paused
                        if !isActivelyRecording {
                            Circle()
                                .fill(micColor.opacity(0.08))
                                .frame(width: 112, height: 112)
                        }

                        // Main mic circle
                        Circle()
                            .fill(micColor)
                            .frame(width: 88, height: 88)
                            .shadow(color: micColor.opacity(0.3), radius: 10, x: 0, y: 4)

                        // Icon: mic when idle/recording, pause when recording (visual hint)
                        Image(systemName: isRecording ? "mic.fill" : "mic.fill")
                            .font(.system(size: 34))
                            .foregroundColor(.white)
                    }
                }
                .padding(.bottom, 24)

                // Waveform — ONLY animates when actively recording, otherwise static flat line
                WaveformView(
                    isAnimating: isActivelyRecording,
                    barCount: 24,
                    tintColor: isActivelyRecording ? .mabelBurgundy : .mabelSubtle.opacity(0.4)
                )
                .padding(.horizontal, 40)
                .padding(.bottom, 20)

                // Timer — 24pt medium
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

                // Typewriter text — only while actively recording
                Text(isActivelyRecording ? typewriterText : "")
                    .font(.comfortaa(14, weight: .regular))
                    .foregroundColor(.mabelSubtle)
                    .multilineTextAlignment(.center)
                    .frame(height: 20)
                    .padding(.bottom, 8)

                Spacer()

                // BOTTOM CONTROLS — evenly sized, aligned in a row
                HStack(spacing: 12) {
                    // Clear — destructive
                    Button(action: {
                        stopTimer()
                        onClear()
                    }) {
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

                    // Pause/Resume — secondary
                    Button(action: toggleRecording) {
                        Text(isRecording ? "Pause" : (hasStartedOnce ? "Resume" : "Record"))
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelTeal)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
                            )
                    }

                    // Save Memory — primary CTA
                    Button(action: {
                        stopTimer()
                        onSave()
                    }) {
                        Text("Save")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .fill(Color.mabelTeal)
                            )
                    }
                }
                .padding(.bottom, 40)
            }
            .padding(.horizontal, 24)
        }
        .navigationBarHidden(true)
        .onDisappear {
            stopTimer()
        }
    }

    // MARK: - Actions

    private func toggleRecording() {
        if isRecording {
            // Currently recording → pause
            isRecording = false
            isPaused = true
            stopTimer()
            micPulse = false
        } else {
            // Currently idle or paused → start/resume recording
            isRecording = true
            isPaused = false
            hasStartedOnce = true
            startTimer()
            micPulse = true
            startTypewriterEffect()
        }
    }

    private func startTimer() {
        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { _ in
                elapsedSeconds += 1
            }
    }

    private func stopTimer() {
        timer?.cancel()
        timer = nil
    }

    private func startTypewriterEffect() {
        let line = boilerplateLines[Int.random(in: 0..<boilerplateLines.count)]
        typewriterText = ""
        var charIndex = 0
        func appendNext() {
            guard charIndex < line.count else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    if isRecording && !isPaused {
                        startTypewriterEffect()
                    }
                }
                return
            }
            let index = line.index(line.startIndex, offsetBy: charIndex)
            typewriterText.append(line[index])
            charIndex += 1
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                if isRecording && !isPaused {
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
            prompt: "What are your favorite family traditions?",
            onSave: {},
            onClear: {}
        )
    }
}
