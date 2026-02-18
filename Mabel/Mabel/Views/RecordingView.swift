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
            // BACKGROUND
            MabelGradientBackground()

            // CONTENT
            VStack(spacing: 0) {
                // Prompt header
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

                // Mic circle
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

                // Waveform
                WaveformView(
                    isAnimating: isRecording && !isPaused,
                    barCount: 24,
                    tintColor: micColor
                )
                .padding(.horizontal, 40)
                .padding(.bottom, 20)

                // Timer
                Text(formattedTime)
                    .font(.comfortaa(24, weight: .medium))
                    .foregroundColor(.mabelText)
                    .monospacedDigit()
                    .padding(.bottom, 4)

                // Status
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

                Spacer()

                // Bottom controls
                HStack(spacing: 24) {
                    // Clear button — text only, burgundy
                    Button(action: {
                        stopTimer()
                        onClear()
                    }) {
                        Text("Clear")
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelBurgundy)
                    }

                    Spacer()

                    // Pause/Resume button — secondary style
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

                    // Save Memory button — teal CTA style
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
