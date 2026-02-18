import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    @State private var mascotGlow = false

    var body: some View {
        ZStack {
            // BACKGROUND — fills entire screen
            MabelGradientBackground()

            // CONTENT — respects safe areas
            VStack(spacing: 0) {
                // Brand anchor — wordmark at top
                MabelWordmark(height: 32)
                    .padding(.top, 16)
                    .padding(.bottom, 20)

                // Mascot with warm glow — top third, tight to headline
                ZStack {
                    // Soft radial glow behind mascot
                    Circle()
                        .fill(
                            RadialGradient(
                                gradient: Gradient(colors: [
                                    Color.mabelGold.opacity(0.15),
                                    Color.mabelGold.opacity(0.05),
                                    Color.clear
                                ]),
                                center: .center,
                                startRadius: 20,
                                endRadius: 140
                            )
                        )
                        .frame(width: 280, height: 280)
                        .scaleEffect(mascotGlow ? 1.05 : 1.0)
                        .animation(
                            .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                            value: mascotGlow
                        )

                    Image("MabelMascot")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200, height: 200)
                }
                .padding(.bottom, 16)

                // Headline — grouped tightly with mascot and subcopy
                Text("Tell your story")
                    .font(.comfortaa(32, weight: .bold))
                    .foregroundColor(.mabelText)
                    .padding(.bottom, 6)

                // Subcopy — tighter, warmer, slightly larger
                Text("Your stories, written with care.")
                    .font(.comfortaa(17, weight: .medium))
                    .foregroundColor(.mabelText.opacity(0.65))
                    .multilineTextAlignment(.center)

                // Push CTA toward bottom
                Spacer()

                // CTA
                CTAButton(title: "Start telling", action: onGetStarted)

                // Sign-in link
                Button(action: {}) {
                    HStack(spacing: 4) {
                        Text("Already have an account?")
                            .foregroundColor(.mabelSubtle)
                        Text("Sign in")
                            .foregroundColor(.mabelTeal)
                    }
                    .font(.comfortaa(14, weight: .regular))
                }
                .padding(.top, 12)
                .padding(.bottom, 40)
            }
            .padding(.horizontal, 24)
        }
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
