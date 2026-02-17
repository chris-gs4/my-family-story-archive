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
        VStack(spacing: 0) {
            // Wordmark
            MabelWordmark(height: scaled(26))
                .padding(.top, 12)
                .padding(.bottom, scaled(24))

            // Prompt header
            if let prompt = prompt {
                Text(prompt)
                    .font(.comfortaa(scaled(20), weight: .bold))
                    .foregroundColor(.mabelText)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 4)

                Text("Selected prompt")
                    .font(.comfortaa(scaled(12), weight: .regular))
                    .foregroundColor(.mabelSubtle)
                    .padding(.bottom, scaled(24))
            } else {
                Text("Free Recording")
                    .font(.comfortaa(scaled(20), weight: .bold))
                    .foregroundColor(.mabelText)
                    .padding(.bottom, scaled(24))
            }

            Spacer()

            // Mic circle
            ZStack {
                // Outer glow when recording
                if isRecording && !isPaused {
                    Circle()
                        .fill(micColor.opacity(0.15))
                        .frame(width: scaled(120), height: scaled(120))
                        .scaleEffect(isRecording ? 1.2 : 1.0)
                        .animation(
                            .easeInOut(duration: 1.0).repeatForever(autoreverses: true),
                            value: isRecording
                        )
                }

                Circle()
                    .fill(micColor)
                    .frame(width: scaled(88), height: scaled(88))
                    .shadow(color: micColor.opacity(0.3), radius: 10, x: 0, y: 4)

                Image(systemName: isPaused ? "pause.fill" : "mic.fill")
                    .font(.system(size: scaled(34)))
                    .foregroundColor(.white)
            }
            .padding(.bottom, scaled(24))

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
                .font(.comfortaa(scaled(36), weight: .bold))
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
                    .font(.comfortaa(scaled(14), weight: .medium))
                    .foregroundColor(.mabelSubtle)
            }

            Spacer()

            // Bottom controls
            HStack(spacing: scaled(20)) {
                // Clear button
                Button(action: {
                    stopTimer()
                    onClear()
                }) {
                    VStack(spacing: 6) {
                        Image(systemName: "xmark.circle")
                            .font(.system(size: scaled(24)))
                        Text("Clear")
                            .font(.comfortaa(scaled(12), weight: .medium))
                    }
                    .foregroundColor(.mabelSubtle)
                    .frame(width: scaled(72), height: scaled(60))
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.mabelSurface)
                    )
                }

                // Pause/Resume button
                Button(action: {
                    if isPaused {
                        isPaused = false
                        startTimer()
                    } else {
                        isPaused = true
                        stopTimer()
                    }
                }) {
                    VStack(spacing: 6) {
                        Image(systemName: isPaused ? "play.fill" : "pause.fill")
                            .font(.system(size: scaled(24)))
                        Text(isPaused ? "Resume" : "Pause")
                            .font(.comfortaa(scaled(12), weight: .medium))
                    }
                    .foregroundColor(.mabelTeal)
                    .frame(width: scaled(72), height: scaled(60))
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.mabelSurface)
                    )
                }

                // Save Memory button
                Button(action: {
                    stopTimer()
                    onSave()
                }) {
                    VStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: scaled(24)))
                        Text("Save\nMemory")
                            .font(.comfortaa(scaled(11), weight: .bold))
                            .multilineTextAlignment(.center)
                    }
                    .foregroundColor(.mabelBackground)
                    .frame(width: scaled(72), height: scaled(60))
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.mabelTeal)
                    )
                }
            }
            .padding(.bottom, 40)
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.mabelBackground.ignoresSafeArea())
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
