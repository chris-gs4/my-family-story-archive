import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    var body: some View {
        ZStack {
            MabelGradientBackground()

            GeometryReader { geo in
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        // Wordmark
                        Image("MabelWordmark")
                            .renderingMode(.original)
                            .resizable()
                            .scaledToFit()
                            .frame(height: 24)
                            .padding(.top, 16)
                            .padding(.bottom, 24)

                        // Mascot with radial gold glow
                        ZStack {
                            RadialGradient(
                                colors: [Color.mabelGold.opacity(0.15), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: 165
                            )
                            .frame(width: 330, height: 330)

                            Image("MabelMascot")
                                .renderingMode(.original)
                                .resizable()
                                .scaledToFit()
                                .frame(width: 220, height: 220)
                        }
                        .padding(.bottom, 32)

                        // Text + CTA
                        Text("Tell your story")
                            .font(.comfortaa(32, weight: .bold))
                            .foregroundColor(.mabelText)
                            .multilineTextAlignment(.center)
                            .padding(.bottom, 16)

                        Text("Record your memories. Mabel will turn them\ninto something beautiful.")
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelSubtle)
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                            .padding(.bottom, 32)

                        CTAButton(title: "Get Started", action: onGetStarted)
                            .padding(.bottom, 12)

                        Button(action: {
                            // Sign in action — placeholder for future
                        }) {
                            Text("Already have an account? Sign in")
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelSubtle)
                        }
                        .padding(.bottom, 40)
                    }
                    .padding(.horizontal, 24)
                    .frame(minHeight: geo.size.height)
                }
            }
        }
        .navigationBarHidden(true)
    }
}

#Preview {
    NavigationStack {
        WelcomeView(onGetStarted: {})
    }
}
