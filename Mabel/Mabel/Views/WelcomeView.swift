import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    var body: some View {
        ZStack {
            MabelGradientBackground()

            VStack(spacing: 0) {
                // Top half — mascot / animation area
                Image("MabelMascot")
                    .renderingMode(.original)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 280, height: 280)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                // Bottom half — text + CTA
                VStack(spacing: 0) {
                    Text("Welcome to Mabel")
                        .font(.comfortaa(32, weight: .bold))
                        .foregroundColor(.mabelText)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, 20)

                    Text("Your warmest writing partner.")
                        .font(.comfortaa(17, weight: .medium))
                        .foregroundColor(.mabelTeal)
                        .multilineTextAlignment(.center)
                        .kerning(0.4)
                        .padding(.bottom, 20)

                    Text("I help you capture your stories and\nturn them into something beautiful.")
                        .font(.comfortaa(15, weight: .medium))
                        .foregroundColor(.mabelText.opacity(0.85))
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                        .padding(.bottom, 20)

                    Text("No typing, just talking!")
                        .font(.comfortaa(14, weight: .regular))
                        .foregroundColor(.mabelText.opacity(0.85))

                    Spacer()

                    CTAButton(title: "GET STARTED", action: onGetStarted)
                        .padding(.bottom, 50)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
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
