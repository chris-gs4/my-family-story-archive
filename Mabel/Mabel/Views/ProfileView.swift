import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var displayName = ""
    @State private var selectedGender: String? = nil
    @State private var showResetAlert = false

    private let genderOptions = ["Male", "Female", "Other"]

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                MabelWordmarkLockup()
                Spacer()
                Button(action: { dismiss() }) {
                    ZStack {
                        Circle()
                            .fill(Color.mabelBackgroundAlt)
                            .frame(width: 44, height: 44)
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.mabelSubtle)
                    }
                    .contentShape(Circle())
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

                            TextField("Your name", text: $displayName)
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
                                ForEach(genderOptions, id: \.self) { gender in
                                    PillButton(
                                        title: gender,
                                        isSelected: selectedGender == gender
                                    ) {
                                        selectedGender = gender
                                    }
                                }
                            }
                        }

                        // Payment Method (placeholder)
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
                    CTAButton(title: "SAVE") {
                        appState.updateProfile(
                            displayName: displayName.trimmingCharacters(in: .whitespaces),
                            gender: selectedGender
                        )
                        dismiss()
                    }
                    .padding(.bottom, MabelSpacing.md)

                    SecondaryButton(title: "HOME") {
                        dismiss()
                    }
                    .padding(.bottom, MabelSpacing.md)

                    DestructiveButton(title: "LOG OUT") {
                        appState.logout()
                        dismiss()
                    }

                    #if DEBUG
                    // Developer Tools
                    VStack(alignment: .leading, spacing: MabelSpacing.md) {
                        Text("Developer Tools")
                            .formLabelStyle()
                            .foregroundColor(.mabelSubtle)
                            .padding(.top, MabelSpacing.xl)

                        Button(action: {
                            appState.seedDummyData()
                            dismiss()
                        }) {
                            Text("SEED DUMMY DATA")
                                .font(MabelTypography.badge())
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(Capsule().fill(Color.mabelPrimary))
                        }

                        Button(action: {
                            showResetAlert = true
                        }) {
                            Text("RESET ALL DATA")
                                .font(MabelTypography.badge())
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(Capsule().fill(Color.mabelBurgundy))
                        }
                    }
                    #endif

                    Spacer()
                        .frame(height: MabelSpacing.bottomSafe)
                }
                .screenPadding()
            }
        }
        .background(
            Color.mabelBackground
                .ignoresSafeArea(.all, edges: .all)
        )
        .alert("Reset All Data?", isPresented: $showResetAlert) {
            Button("Reset", role: .destructive) {
                appState.resetAll()
                dismiss()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will permanently delete all your stories, chapters, and profile data. This cannot be undone.")
        }
        .onAppear {
            displayName = appState.userProfile?.displayName ?? ""
            selectedGender = appState.userProfile?.gender
        }
    }
}

#Preview {
    ProfileView()
        .environment(AppState())
}
