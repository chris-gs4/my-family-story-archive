import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    var body: some View {
        ZStack {
            MabelGradientBackground()

            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 60)

                // Centered Mascot - BIGGER
                Image("MabelMascot")
                    .renderingMode(.original)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 200, height: 200)
                    .padding(.bottom, 36)

                // Welcome Text
                Text("Welcome to Mabel")
                    .font(.comfortaa(32, weight: .bold))
                    .foregroundColor(.mabelText)
                    .multilineTextAlignment(.center)
                    .padding(.bottom, 12)

                // Tagline
                Text("Journal Freely. Share Beautifully.")
                    .font(.comfortaa(17, weight: .medium))
                    .foregroundColor(.mabelTeal)
                    .multilineTextAlignment(.center)
                    .kerning(0.4)
                    .padding(.bottom, 32)

                // Description - BETTER CONTRAST
                VStack(spacing: 20) {
                    Text("Transform your thoughts into\npolished narratives")
                        .font(.comfortaa(15, weight: .medium))
                        .foregroundColor(.mabelText.opacity(0.85))
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)

                    Text("Speak or type—we'll do the rest")
                        .font(.comfortaa(14, weight: .regular))
                        .foregroundColor(.mabelText.opacity(0.75))
                }
                .multilineTextAlignment(.center)

                Spacer()

                // CTA
                CTAButton(title: "GET STARTED", action: onGetStarted)
                    .padding(.bottom, 50)
            }
            .padding(.horizontal, 36)
        }
        .navigationBarHidden(true)
    }
}

#Preview {
    NavigationStack {
        WelcomeView(onGetStarted: {})
    }
}
