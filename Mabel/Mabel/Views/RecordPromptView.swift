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
        ZStack {
            // BACKGROUND
            MabelGradientBackground()

            // CONTENT
            ScrollView {
                VStack(spacing: 0) {
                    // Wordmark
                    MabelWordmark(height: 32)
                        .padding(.top, 16)
                        .padding(.bottom, 24)

                    // Heading
                    Text("What story would you\nlike to tell?")
                        .font(.comfortaa(28, weight: .bold))
                        .foregroundColor(.mabelText)
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                        .padding(.bottom, 8)

                    // Subtext
                    Text("Tap the button and start speaking.")
                        .font(.comfortaa(16, weight: .regular))
                        .foregroundColor(.mabelSubtle)
                        .padding(.bottom, 28)

                    // Mic button with pulse
                    Button(action: {
                        onStartRecording(nil)
                    }) {
                        ZStack {
                            // Pulse rings
                            Circle()
                                .fill(Color.mabelTeal.opacity(0.1))
                                .frame(width: 100, height: 100)
                                .scaleEffect(micPulse ? 1.3 : 1.0)
                                .opacity(micPulse ? 0.0 : 0.5)
                                .animation(
                                    .easeOut(duration: 1.5).repeatForever(autoreverses: false),
                                    value: micPulse
                                )

                            Circle()
                                .fill(Color.mabelTeal.opacity(0.15))
                                .frame(width: 100, height: 100)
                                .scaleEffect(micPulse ? 1.15 : 1.0)
                                .opacity(micPulse ? 0.0 : 0.6)
                                .animation(
                                    .easeOut(duration: 1.5).repeatForever(autoreverses: false).delay(0.3),
                                    value: micPulse
                                )

                            // Main circle
                            Circle()
                                .fill(Color.mabelTeal)
                                .frame(width: 80, height: 80)
                                .shadow(color: Color.mabelTeal.opacity(0.3), radius: 8, x: 0, y: 4)

                            Image(systemName: "mic.fill")
                                .font(.system(size: 30))
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.bottom, 16)

                    // "or write here" text link
                    if !isShowingWriteInput {
                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.25)) {
                                isShowingWriteInput = true
                            }
                        }) {
                            Text("or write here")
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelSubtle)
                        }
                        .padding(.bottom, 24)
                    } else {
                        // Expandable text editor
                        VStack(spacing: 8) {
                            TextEditor(text: $writtenPrompt)
                                .font(.comfortaa(16, weight: .regular))
                                .foregroundColor(.mabelText)
                                .scrollContentBackground(.hidden)
                                .frame(height: 80)
                                .padding(12)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.mabelSurface.opacity(0.9))
                                )

                            HStack(spacing: 12) {
                                Button("Cancel") {
                                    withAnimation(.easeInOut(duration: 0.25)) {
                                        isShowingWriteInput = false
                                        writtenPrompt = ""
                                    }
                                }
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelSubtle)

                                Spacer()

                                Button("Start Recording") {
                                    onStartRecording(writtenPrompt.isEmpty ? nil : writtenPrompt)
                                }
                                .font(.comfortaa(14, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Capsule().fill(Color.mabelTeal))
                            }
                        }
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
                    .frame(maxWidth: .infinity, alignment: .leading)

                    Spacer()
                        .frame(height: 40)
                }
                .padding(.horizontal, 24)
            }
        }
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
