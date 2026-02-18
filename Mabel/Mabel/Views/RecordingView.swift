import SwiftUI
import Combine

struct RecordingView: View {
    let prompt: String?
    let onSave: () -> Void
    let onClear: () -> Void

    @State private var isRecording = true
    @State private var isPaused = false
    @State private var elapsedSeconds: Int = 0
    @State private var timer: AnyCancellable?
    @State private var typewriterText: String = ""

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
        return "Ready"
    }

    private var micColor: Color {
        if isPaused { return .mabelSubtle }
        return isRecording ? .mabelBurgundy : .mabelTeal
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

                // Mic circle — changes color: teal (idle) → burgundy (recording)
                ZStack {
                    // Outer glow when recording
                    if isRecording && !isPaused {
                        Circle()
                            .fill(micColor.opacity(0.15))
                            .frame(width: 120, height: 120)
                            .scaleEffect(isRecording ? 1.2 : 1.0)
                            .animation(
                                .easeInOut(duration: 1.0).repeatForever(autoreverses: true),
                                value: isRecording
                            )
                    }

                    Circle()
                        .fill(micColor)
                        .frame(width: 88, height: 88)
                        .shadow(color: micColor.opacity(0.3), radius: 10, x: 0, y: 4)

                    Image(systemName: isPaused ? "pause.fill" : "mic.fill")
                        .font(.system(size: 34))
                        .foregroundColor(.white)
                }
                .padding(.bottom, 24)

                // Waveform — animated vertical bars
                WaveformView(
                    isAnimating: isRecording && !isPaused,
                    barCount: 24,
                    tintColor: micColor
                )
                .padding(.horizontal, 40)
                .padding(.bottom, 20)

                // Timer — 24pt medium
                Text(formattedTime)
                    .font(.comfortaa(24, weight: .medium))
                    .foregroundColor(.mabelText)
                    .monospacedDigit()
                    .padding(.bottom, 4)

                // Status — "Recording" / "Paused"
                HStack(spacing: 6) {
                    if isRecording && !isPaused {
                        Circle()
                            .fill(Color.mabelBurgundy)
                            .frame(width: 8, height: 8)
                    }
                    Text(statusText)
                        .font(.comfortaa(14, weight: .medium))
                        .foregroundColor(.mabelSubtle)
                }
                .padding(.bottom, 16)

                // Boilerplate typewriter text — cosmetic "Mabel is writing..." effect
                if isRecording && !isPaused {
                    Text(typewriterText)
                        .font(.comfortaa(14, weight: .regular))
                        .foregroundColor(.mabelSubtle)
                        .multilineTextAlignment(.center)
                        .frame(height: 20)
                        .padding(.bottom, 8)
                }

                Spacer()

                // Bottom controls — three buttons in a row
                HStack(spacing: 24) {
                    // Clear — text only, burgundy
                    Button(action: {
                        stopTimer()
                        onClear()
                    }) {
                        Text("Clear")
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelBurgundy)
                    }

                    Spacer()

                    // Pause/Resume — secondary style
                    Button(action: {
                        if isPaused {
                            isPaused = false
                            startTimer()
                        } else {
                            isPaused = true
                            stopTimer()
                        }
                    }) {
                        Text(isPaused ? "Resume" : "Pause")
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelTeal)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(
                                Capsule()
                                    .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
                            )
                    }

                    Spacer()

                    // Save Memory — teal CTA style
                    Button(action: {
                        stopTimer()
                        onSave()
                    }) {
                        Text("Save Memory")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
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
        .onAppear {
            startTimer()
            startTypewriterEffect()
        }
        .onDisappear {
            stopTimer()
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
                // Pause then start a new line
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
