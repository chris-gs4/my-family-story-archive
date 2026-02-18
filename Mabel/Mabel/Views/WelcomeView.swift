import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    @State private var mascotGlow = false

    var body: some View {
        ZStack {
            // BACKGROUND — fills entire screen, edge to edge
            MabelGradientBackground()

            // CONTENT — respects safe areas
            VStack(spacing: 0) {
                // Wordmark image — subtle brand anchor at top
                Image("MabelWordmark")
                    .renderingMode(.original)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 18)
                    .padding(.top, 16)

                // Smaller spacer above — pushes center block into upper-middle
                Spacer()
                    .frame(minHeight: 8, maxHeight: .infinity)

                // CENTER BLOCK: mascot + headline + subtext as one cohesive group
                VStack(spacing: 0) {
                    // Mascot with warm glow — 250pt hero
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
                                    startRadius: 30,
                                    endRadius: 170
                                )
                            )
                            .frame(width: 340, height: 340)
                            .scaleEffect(mascotGlow ? 1.05 : 1.0)
                            .animation(
                                .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                                value: mascotGlow
                            )

                        Image("MabelMascot")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 250, height: 250)
                    }
                    .padding(.bottom, 16)

                    // Headline — 34pt bold
                    Text("Tell your story")
                        .font(.comfortaa(34, weight: .bold))
                        .foregroundColor(.mabelText)
                        .padding(.bottom, 8)

                    // Subtext — 16pt regular
                    Text("Record your memories. Mabel will turn\nthem into something beautiful.")
                        .font(.comfortaa(16, weight: .regular))
                        .foregroundColor(.mabelSubtle)
                        .multilineTextAlignment(.center)
                }

                // Larger spacer below — gives more room, pushes content upward
                Spacer()
                    .frame(minHeight: 20, maxHeight: .infinity)
                Spacer()
                    .frame(minHeight: 20, maxHeight: .infinity)

                // CTA pinned near bottom
                CTAButton(title: "Get Started", action: onGetStarted)

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
                .padding(.top, 8)
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
