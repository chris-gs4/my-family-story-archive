import SwiftUI

// MARK: - Profile Concept A: "Token Polish"
// UX Principle: Consistency (Nielsen) — pure token swap. formLabelStyle for labels,
// body() for inputs, spacing tokens throughout. HOME -> SecondaryButton,
// LOG OUT -> DestructiveButton (burgundy). Dev tools use badge() font. Low risk.

struct ProfileConceptA: View {
    @State private var name = "Margaret"
    @State private var selectedGender: String? = "Female"

    var body: some View {
        ZStack {
            MabelGradientBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    HStack {
                        MabelWordmarkLockup()
                        Spacer()
                        ZStack {
                            Circle()
                                .fill(Color.mabelBackgroundAlt)
                                .frame(width: 44, height: 44)
                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.mabelSubtle)
                        }
                    }
                    .padding(.top, MabelSpacing.xl)
                    .padding(.bottom, MabelSpacing.sectionGap)

                    // Display Name
                    VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                        Text("Display Name")
                            .formLabelStyle()

                        TextField("Your name", text: $name)
                            .font(MabelTypography.body())
                            .foregroundColor(.mabelText)
                            .padding(.horizontal, MabelSpacing.inputPadH)
                            .padding(.vertical, MabelSpacing.inputPadV)
                            .background(
                                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                    .fill(Color.mabelSurface)
                            )
                    }
                    .padding(.bottom, MabelSpacing.xl)

                    // Gender
                    VStack(alignment: .leading, spacing: MabelSpacing.pillPadV) {
                        Text("Gender")
                            .formLabelStyle()

                        HStack(spacing: MabelSpacing.tightGap) {
                            ForEach(["Male", "Female", "Other"], id: \.self) { g in
                                PillButton(title: g, isSelected: selectedGender == g) {
                                    selectedGender = g
                                }
                            }
                        }
                    }
                    .padding(.bottom, MabelSpacing.xl)

                    // Payment
                    VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                        Text("Payment Method")
                            .formLabelStyle()

                        TextField("Coming soon...", text: .constant(""))
                            .font(MabelTypography.body())
                            .foregroundColor(.mabelSubtle)
                            .disabled(true)
                            .padding(.horizontal, MabelSpacing.inputPadH)
                            .padding(.vertical, MabelSpacing.inputPadV)
                            .background(
                                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                    .fill(Color.mabelSurface)
                            )
                    }
                    .padding(.bottom, MabelSpacing.xxxl)

                    // Buttons
                    CTAButton(title: "SAVE") {}
                        .padding(.bottom, MabelSpacing.md)

                    SecondaryButton(title: "HOME") {}
                        .padding(.bottom, MabelSpacing.md)

                    DestructiveButton(title: "LOG OUT") {}

                    Spacer().frame(height: MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
    }
}

// MARK: - Profile Concept B: "Settings Card"
// UX Principle: Figure-Ground (Gestalt) + Proximity — groups form fields into
// a bordered card, creating a clear "settings" surface. Buttons separated below
// the card. Section label "YOUR PROFILE" at top. Flat white background.
// Dismiss button gets circle background. Consistent with other uplifted screens.

struct ProfileConceptB: View {
    @State private var name = "Margaret"
    @State private var selectedGender: String? = "Female"

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                MabelWordmarkLockup()
                Spacer()
                ZStack {
                    Circle()
                        .fill(Color.mabelBackgroundAlt)
                        .frame(width: 44, height: 44)
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.mabelSubtle)
                }
            }
            .padding(.horizontal, MabelSpacing.screenPadH)
            .topSafePadding()
            .padding(.bottom, MabelSpacing.tightGap)

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    // Section label
                    Text("Your Profile")
                        .sectionLabelStyle()
                        .padding(.top, MabelSpacing.elementGap)
                        .padding(.bottom, MabelSpacing.elementGap)

                    // Settings card
                    VStack(alignment: .leading, spacing: MabelSpacing.xl) {
                        // Display Name
                        VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                            Text("Display Name")
                                .formLabelStyle()

                            TextField("Your name", text: $name)
                                .font(MabelTypography.body())
                                .foregroundColor(.mabelText)
                                .padding(.horizontal, MabelSpacing.inputPadH)
                                .padding(.vertical, MabelSpacing.inputPadV)
                                .background(
                                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                        .fill(Color.mabelBackgroundAlt)
                                )
                        }

                        // Gender
                        VStack(alignment: .leading, spacing: MabelSpacing.pillPadV) {
                            Text("Gender")
                                .formLabelStyle()

                            HStack(spacing: MabelSpacing.tightGap) {
                                ForEach(["Male", "Female", "Other"], id: \.self) { g in
                                    PillButton(title: g, isSelected: selectedGender == g) {
                                        selectedGender = g
                                    }
                                }
                            }
                        }

                        // Payment
                        VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                            Text("Payment Method")
                                .formLabelStyle()

                            TextField("Coming soon...", text: .constant(""))
                                .font(MabelTypography.body())
                                .foregroundColor(.mabelSubtle)
                                .disabled(true)
                                .padding(.horizontal, MabelSpacing.inputPadH)
                                .padding(.vertical, MabelSpacing.inputPadV)
                                .background(
                                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                        .fill(Color.mabelBackgroundAlt)
                                )
                        }
                    }
                    .cardPadding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusCard)
                            .fill(Color.mabelSurface)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusCard)
                            .strokeBorder(Color.mabelBorderWarm, lineWidth: MabelSpacing.borderCard)
                    )
                    .mabelCardShadow()
                    .padding(.bottom, MabelSpacing.sectionGap)

                    // Action buttons — outside the card
                    CTAButton(title: "SAVE") {}
                        .padding(.bottom, MabelSpacing.md)

                    SecondaryButton(title: "HOME") {}
                        .padding(.bottom, MabelSpacing.md)

                    DestructiveButton(title: "LOG OUT") {}

                    Spacer().frame(height: MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
        .background(
            Color.mabelBackground.ignoresSafeArea(.all, edges: .all)
        )
    }
}

// MARK: - Profile Concept C: "Minimal Form"
// UX Principle: Aesthetic-Minimalist (Nielsen) — strips the profile to its essentials.
// No card wrapper — fields sit directly on white background with subtle dividers.
// Save is the only CTA; Home and Log Out are text links at the bottom.
// Most minimal approach. Flat white background.

struct ProfileConceptC: View {
    @State private var name = "Margaret"
    @State private var selectedGender: String? = "Female"

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                MabelWordmarkLockup()
                Spacer()
                ZStack {
                    Circle()
                        .fill(Color.mabelBackgroundAlt)
                        .frame(width: 44, height: 44)
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.mabelSubtle)
                }
            }
            .padding(.horizontal, MabelSpacing.screenPadH)
            .topSafePadding()
            .padding(.bottom, MabelSpacing.tightGap)

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Your Profile")
                        .headingStyle()
                        .padding(.top, MabelSpacing.sectionGap)
                        .padding(.bottom, MabelSpacing.sectionGap)

                    // Display Name
                    VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                        Text("Display Name")
                            .formLabelStyle()

                        TextField("Your name", text: $name)
                            .font(MabelTypography.body())
                            .foregroundColor(.mabelText)
                            .padding(.horizontal, MabelSpacing.inputPadH)
                            .padding(.vertical, MabelSpacing.inputPadV)
                            .background(
                                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                    .fill(Color.mabelBackgroundAlt)
                            )
                    }
                    .padding(.bottom, MabelSpacing.xl)

                    // Gender
                    VStack(alignment: .leading, spacing: MabelSpacing.pillPadV) {
                        Text("Gender")
                            .formLabelStyle()

                        HStack(spacing: MabelSpacing.tightGap) {
                            ForEach(["Male", "Female", "Other"], id: \.self) { g in
                                PillButton(title: g, isSelected: selectedGender == g) {
                                    selectedGender = g
                                }
                            }
                        }
                    }
                    .padding(.bottom, MabelSpacing.xl)

                    // Payment
                    VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                        Text("Payment Method")
                            .formLabelStyle()

                        Text("Coming soon...")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                    }
                    .padding(.bottom, MabelSpacing.xxxl)

                    // Save only
                    CTAButton(title: "SAVE") {}
                        .padding(.bottom, MabelSpacing.sectionGap)

                    // Text links
                    HStack {
                        Spacer()
                        Button(action: {}) {
                            Text("Home")
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelPrimary)
                        }
                        Text("\u{2022}")
                            .foregroundColor(.mabelSubtle)
                        Button(action: {}) {
                            Text("Log Out")
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelBurgundy)
                        }
                        Spacer()
                    }

                    Spacer().frame(height: MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
        .background(
            Color.mabelBackground.ignoresSafeArea(.all, edges: .all)
        )
    }
}

// MARK: - Previews

#Preview("Concept A \u{2014} Token Polish") {
    ProfileConceptA()
}

#Preview("Concept B \u{2014} Settings Card") {
    ProfileConceptB()
}

#Preview("Concept C \u{2014} Minimal Form") {
    ProfileConceptC()
}
