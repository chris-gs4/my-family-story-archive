import SwiftUI

struct RecordPromptView: View {
    let onStartRecording: (String?) -> Void

    @State private var isShowingWriteInput = false
    @State private var writtenPrompt = ""
    @State private var micPulse = false

    private let suggestions = [
        "What are your favorite family traditions?",
        "Describe your childhood home.",
        "Tell me about when you first met Grandma."
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Wordmark
            MabelWordmark(height: scaled(26))
                .padding(.top, 12)
                .padding(.bottom, scaled(24))

            // Heading
            Text("What story would you\nlike to tell?")
                .font(.comfortaa(scaled(24), weight: .bold))
                .foregroundColor(.mabelText)
                .multilineTextAlignment(.center)
                .lineSpacing(2)
                .padding(.bottom, 8)

            // Subtext
            Text("Tap the button and start speaking.")
                .font(.comfortaa(scaled(14), weight: .regular))
                .foregroundColor(.mabelSubtle)
                .padding(.bottom, scaled(28))

            // Mic button with pulse
            Button(action: {
                onStartRecording(nil)
            }) {
                ZStack {
                    // Pulse rings
                    Circle()
                        .fill(Color.mabelTeal.opacity(0.1))
                        .frame(width: scaled(100), height: scaled(100))
                        .scaleEffect(micPulse ? 1.3 : 1.0)
                        .opacity(micPulse ? 0.0 : 0.5)
                        .animation(
                            .easeOut(duration: 1.5).repeatForever(autoreverses: false),
                            value: micPulse
                        )

                    Circle()
                        .fill(Color.mabelTeal.opacity(0.15))
                        .frame(width: scaled(100), height: scaled(100))
                        .scaleEffect(micPulse ? 1.15 : 1.0)
                        .opacity(micPulse ? 0.0 : 0.6)
                        .animation(
                            .easeOut(duration: 1.5).repeatForever(autoreverses: false).delay(0.3),
                            value: micPulse
                        )

                    // Main circle
                    Circle()
                        .fill(Color.mabelTeal)
                        .frame(width: scaled(80), height: scaled(80))
                        .shadow(color: Color.mabelTeal.opacity(0.3), radius: 8, x: 0, y: 4)

                    Image(systemName: "mic.fill")
                        .font(.system(size: scaled(30)))
                        .foregroundColor(.white)
                }
            }
            .padding(.bottom, 16)

            // "or write here" button
            if !isShowingWriteInput {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        isShowingWriteInput = true
                    }
                }) {
                    Text("or write here")
                        .font(.comfortaa(13, weight: .medium))
                        .foregroundColor(.mabelTeal)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .strokeBorder(Color.mabelTeal, lineWidth: 1)
                        )
                }
                .padding(.bottom, 24)
            } else {
                // Expandable text editor
                VStack(spacing: 8) {
                    TextEditor(text: $writtenPrompt)
                        .font(.comfortaa(14, weight: .regular))
                        .foregroundColor(.mabelText)
                        .scrollContentBackground(.hidden)
                        .frame(height: 80)
                        .padding(12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.white)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .strokeBorder(Color.mabelTeal.opacity(0.4), lineWidth: 1)
                        )

                    HStack(spacing: 12) {
                        Button("Cancel") {
                            withAnimation(.easeInOut(duration: 0.25)) {
                                isShowingWriteInput = false
                                writtenPrompt = ""
                            }
                        }
                        .font(.comfortaa(13, weight: .regular))
                        .foregroundColor(.mabelSubtle)

                        Spacer()

                        Button("Start Recording") {
                            onStartRecording(writtenPrompt.isEmpty ? nil : writtenPrompt)
                        }
                        .font(.comfortaa(13, weight: .bold))
                        .foregroundColor(.mabelBackground)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Capsule().fill(Color.mabelTeal))
                    }
                }
                .padding(.horizontal, 4)
                .padding(.bottom, 20)
            }

            // Suggestions
            VStack(alignment: .leading, spacing: 8) {
                Text("Suggestions")
                    .font(.comfortaa(16, weight: .bold))
                    .foregroundColor(.mabelText)
                    .padding(.bottom, 4)

                ForEach(suggestions, id: \.self) { suggestion in
                    SuggestionCard(prompt: suggestion) {
                        onStartRecording(suggestion)
                    }
                }
            }

            Spacer()
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.mabelBackground.ignoresSafeArea())
        .navigationBarHidden(true)
        .onAppear {
            micPulse = true
        }
    }
}

#Preview {
    NavigationStack {
        RecordPromptView(onStartRecording: { _ in })
    }
}
