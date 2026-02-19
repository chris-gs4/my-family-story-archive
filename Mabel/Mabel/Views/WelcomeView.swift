import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    var body: some View {
        ZStack {
            MabelGradientBackground()

            VStack(spacing: 0) {
                // Wordmark at top
                Image("MabelWordmark")
                    .renderingMode(.original)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 18)
                    .padding(.top, 16)

                Spacer()

                // Center content
                VStack(spacing: 16) {
                    Text("Welcome to Mabel")
                        .font(.comfortaa(34, weight: .bold))
                        .foregroundColor(.mabelText)
                        .multilineTextAlignment(.center)

                    VStack(spacing: 8) {
                        Text("Your AI-assisted ghost writer.")
                            .font(.comfortaa(16, weight: .medium))
                            .foregroundColor(.mabelText)

                        Text("Capture your stories and write a book\nfor future generations.")
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelSubtle)
                            .multilineTextAlignment(.center)

                        Text("No typing, just talking.")
                            .font(.comfortaa(16, weight: .medium))
                            .foregroundColor(.mabelText)
                    }
                }

                Spacer()
                Spacer()

                // CTA
                CTAButton(title: "GET STARTED", action: onGetStarted)
                    .padding(.bottom, 40)
            }
            .padding(.horizontal, 24)
        }
        .navigationBarHidden(true)
    }
}

#Preview {
    NavigationStack {
        WelcomeView(onGetStarted: {})
    }
}
