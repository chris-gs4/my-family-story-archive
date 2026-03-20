import SwiftUI

// MARK: - Welcome Screen Concept A: "Elevated Simplicity"
// UX Principle: Figure-Ground (Gestalt) — maximize contrast between mascot and background
// with subtle depth cues. Minimal elements, maximum breathing room.

struct WelcomeConceptA: View {
    var body: some View {
        ZStack {
            MabelBackground()

            VStack(spacing: 0) {
                MabelWordmark(height: MabelSpacing.wordmarkHeight)
                    .padding(.top, MabelSpacing.topSafe)
                    .accessibilityHidden(true)

                Spacer()

                // Mascot with warm gray atmospheric glow
                ZStack {
                    RadialGradient(
                        colors: [Color.mabelText.opacity(0.04), Color.clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: 165
                    )
                    .frame(width: 330, height: 330)

                    Image("MabelMascot")
                        .renderingMode(.original)
                        .resizable()
                        .scaledToFit()
                        .frame(width: MabelSpacing.mascotHero, height: MabelSpacing.mascotHero)
                }
                .accessibilityHidden(true)

                Spacer()

                // Text group
                VStack(spacing: MabelSpacing.elementGap) {
                    Text("Tell your story")
                        .heroHeadingStyle()
                        .multilineTextAlignment(.center)

                    Text("Record your memories. Mabel will turn them\ninto something beautiful.")
                        .bodyStyle()
                        .foregroundColor(.mabelSubtle)
                        .multilineTextAlignment(.center)
                }
                .accessibilityElement(children: .combine)

                Spacer()

                // CTA area
                VStack(spacing: MabelSpacing.md) {
                    CTAButton(title: "Get Started", action: {})

                    Button(action: {}) {
                        Text("Already have an account? Sign in")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                    }
                    .accessibilityHint("Sign in to your existing Mabel account")
                }
                .padding(.bottom, MabelSpacing.bottomSafe)
            }
            .screenPadding()
        }
    }
}

// MARK: - Welcome Screen Concept B: "Story Invitation"
// UX Principle: Proximity (Gestalt) — group mascot tightly with headline to create
// a unified "invitation" block. Adds a trust indicator pill for social proof.

struct WelcomeConceptB: View {
    var body: some View {
        ZStack {
            MabelBackground()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    MabelWordmark(height: MabelSpacing.wordmarkHeight)
                        .padding(.top, MabelSpacing.topSafe)
                        .padding(.bottom, MabelSpacing.xl)
                        .accessibilityHidden(true)

                    // Mascot + headline grouped tightly
                    VStack(spacing: MabelSpacing.elementGap) {
                        ZStack {
                            RadialGradient(
                                colors: [Color.mabelText.opacity(0.04), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: 140
                            )
                            .frame(width: 280, height: 280)

                            Image("MabelMascot")
                                .renderingMode(.original)
                                .resizable()
                                .scaledToFit()
                                .frame(width: MabelSpacing.mascotHero, height: MabelSpacing.mascotHero)
                        }
                        .accessibilityHidden(true)

                        Text("Tell your story")
                            .heroHeadingStyle()
                            .multilineTextAlignment(.center)
                    }
                    .padding(.bottom, MabelSpacing.elementGap)

                    Text("Record your memories. Mabel will turn them\ninto something beautiful.")
                        .bodyStyle()
                        .foregroundColor(.mabelSubtle)
                        .multilineTextAlignment(.center)
                        .padding(.bottom, MabelSpacing.sectionGap)

                    // Trust indicator pill
                    HStack(spacing: MabelSpacing.tightGap) {
                        Image(systemName: "mic.fill")
                            .font(.system(size: MabelSpacing.iconTrust))
                            .foregroundColor(.mabelPrimary)
                        Text("No writing required — just talk")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelText)
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 10)
                    .background(
                        Capsule()
                            .fill(Color.mabelPrimaryLight)
                            .overlay(
                                Capsule()
                                    .strokeBorder(Color.mabelPrimary, lineWidth: MabelSpacing.borderCard)
                            )
                    )
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("No writing required, just talk")
                    .padding(.bottom, MabelSpacing.sectionGap)

                    // CTA area
                    VStack(spacing: MabelSpacing.md) {
                        CTAButton(title: "Get Started", action: {})

                        Button(action: {}) {
                            Text("Already have an account? Sign in")
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelSubtle)
                        }
                        .accessibilityHint("Sign in to your existing Mabel account")
                    }
                    .padding(.bottom, MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
    }
}

// MARK: - Welcome Screen Concept C: "Warm Greeting Card"
// UX Principle: Aesthetic-Minimalist (Nielsen) + Closure (Gestalt) — card-based layout
// wraps the invitation in a warm bordered card, creating a "greeting card" feel
// that matches Mabel's warm journal aesthetic. Content card as hero element.

struct WelcomeConceptC: View {
    var body: some View {
        ZStack {
            Color.mabelBackgroundAlt
                .ignoresSafeArea(.all, edges: .all)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    MabelWordmark(height: MabelSpacing.wordmarkHeight)
                        .padding(.top, MabelSpacing.topSafe)
                        .padding(.bottom, MabelSpacing.xl)
                        .accessibilityHidden(true)

                    // Hero card containing mascot + text
                    VStack(spacing: MabelSpacing.xl) {
                        ZStack {
                            RadialGradient(
                                colors: [Color.mabelText.opacity(0.03), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: 130
                            )
                            .frame(width: 260, height: 260)

                            Image("MabelMascot")
                                .renderingMode(.original)
                                .resizable()
                                .scaledToFit()
                                .frame(width: 200, height: 200)
                        }
                        .accessibilityHidden(true)

                        VStack(spacing: MabelSpacing.tightGap) {
                            Text("Tell your story")
                                .heroHeadingStyle()
                                .multilineTextAlignment(.center)

                            Text("Record your memories. Mabel will\nturn them into something beautiful.")
                                .bodyStyle()
                                .foregroundColor(.mabelSubtle)
                                .multilineTextAlignment(.center)
                        }
                        .accessibilityElement(children: .combine)
                    }
                    .cardPadding()
                    .background(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusCard)
                            .fill(Color.mabelSurface)
                            .overlay(
                                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusCard)
                                    .strokeBorder(Color.mabelBorderWarm, lineWidth: MabelSpacing.borderCard)
                            )
                    )
                    .mabelCardShadow()
                    .padding(.bottom, MabelSpacing.sectionGap)

                    // CTA area
                    VStack(spacing: MabelSpacing.md) {
                        CTAButton(title: "Get Started", action: {})

                        Button(action: {}) {
                            Text("Already have an account? Sign in")
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelSubtle)
                        }
                        .accessibilityHint("Sign in to your existing Mabel account")
                    }
                    .padding(.bottom, MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
    }
}

#Preview("Concept A — Elevated Simplicity") {
    WelcomeConceptA()
}

#Preview("Concept B — Story Invitation") {
    WelcomeConceptB()
}

#Preview("Concept C — Warm Greeting Card") {
    WelcomeConceptC()
}
