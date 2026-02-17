import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    @State private var mascotGlow = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: scaled(20))

            // Wordmark
            MabelWordmark(height: scaled(30))
                .padding(.bottom, scaled(32))

            // Mascot with warm glow
            ZStack {
                // Soft radial glow behind mascot
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color.mabelGold.opacity(0.25),
                                Color.mabelGold.opacity(0.08),
                                Color.clear
                            ]),
                            center: .center,
                            startRadius: scaled(20),
                            endRadius: scaled(140)
                        )
                    )
                    .frame(width: scaled(280), height: scaled(280))
                    .scaleEffect(mascotGlow ? 1.05 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: mascotGlow
                    )

                Image("MabelMascot")
                    .resizable()
                    .scaledToFit()
                    .frame(width: scaled(200), height: scaled(200))
            }
            .padding(.bottom, scaled(32))

            // Headline
            Text("Tell your story")
                .font(.comfortaa(scaled(28), weight: .bold))
                .foregroundColor(.mabelText)
                .padding(.bottom, 8)

            // Subtext
            Text("Record your memories.\nMabel will turn them into something beautiful.")
                .font(.comfortaa(scaled(16), weight: .regular))
                .foregroundColor(.mabelSubtle)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.horizontal, 32)

            Spacer()

            // CTA
            CTAButton(title: "Get Started", action: onGetStarted)
                .padding(.horizontal, 24)

            // Sign-in link placeholder
            Button(action: {}) {
                Text("Already have an account? Sign in")
                    .font(.comfortaa(scaled(13), weight: .regular))
                    .foregroundColor(.mabelSubtle)
            }
            .padding(.top, 12)
            .padding(.bottom, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.mabelBackground.ignoresSafeArea())
        .navigationBarHidden(true)
        .onAppear {
            mascotGlow = true
        }
    }
}

#Preview {
    NavigationStack {
        WelcomeView(onGetStarted: {})
    }
}
