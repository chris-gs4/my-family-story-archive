import SwiftUI

struct WelcomeView: View {
    let onGetStarted: () -> Void

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [.mabelBackground, .mabelBackgroundGradientEnd],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea(.all, edges: .all)

            GeometryReader { geo in
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        Spacer(minLength: MabelSpacing.sectionGap)

                        // Mascot — large, centered, no card or glow
                        Image("MabelMascot")
                            .renderingMode(.original)
                            .resizable()
                            .scaledToFit()
                            .frame(width: MabelSpacing.mascotHero, height: MabelSpacing.mascotHero)
                            .accessibilityHidden(true)
                            .padding(.bottom, MabelSpacing.xl)

                        // Headline — Comfortaa Bold 32pt, -0.02em tracking
                        Text("Welcome to Mabel")
                            .heroHeadingStyle()
                            .multilineTextAlignment(.center)
                            .padding(.bottom, MabelSpacing.elementGap)

                        // Supporting text — Comfortaa Regular 16pt, 1.6 line-height
                        VStack(spacing: MabelSpacing.tightGap) {
                            Text("Your AI-assisted ghost writer.")
                                .font(MabelTypography.body())
                                .foregroundColor(.mabelText.opacity(0.80))
                                .lineSpacing(16 * 0.6)

                            Text("Capture your stories and write a book\nfor future generations.")
                                .font(MabelTypography.body())
                                .foregroundColor(.mabelText.opacity(0.80))
                                .lineSpacing(16 * 0.6)
                                .multilineTextAlignment(.center)

                            Text("No typing, just talking.")
                                .font(MabelTypography.body())
                                .foregroundColor(.mabelText.opacity(0.80))
                                .lineSpacing(16 * 0.6)
                        }
                        .accessibilityElement(children: .combine)

                        Spacer(minLength: MabelSpacing.xxl)

                        // CTA pinned to bottom
                        CTAButton(title: "Get Started", action: onGetStarted)
                            .padding(.bottom, MabelSpacing.bottomSafe)
                    }
                    .screenPadding()
                    .frame(minHeight: geo.size.height)
                }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

#Preview {
    NavigationStack {
        WelcomeView(onGetStarted: {})
    }
}
