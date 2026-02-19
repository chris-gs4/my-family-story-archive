import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var displayName = ""
    @State private var selectedGender: String? = nil

    private let genderOptions = ["Male", "Female", "Other"]

    var body: some View {
        ZStack {
            MabelGradientBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Header
                    HStack {
                        Text("Edit Profile")
                            .font(.comfortaa(22, weight: .bold))
                            .foregroundColor(.mabelText)
                        Spacer()
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.mabelSubtle)
                        }
                    }
                    .padding(.top, 24)
                    .padding(.bottom, 32)

                    // Display Name
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Display Name")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelText)

                        TextField("Your name", text: $displayName)
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelText)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.mabelSurface.opacity(0.9))
                            )
                    }
                    .padding(.bottom, 24)

                    // Gender
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Gender")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelText)

                        HStack(spacing: 8) {
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
                    .padding(.bottom, 24)

                    // Payment Method (placeholder)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Payment Method")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelText)

                        TextField("Coming soon...", text: .constant(""))
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelSubtle)
                            .disabled(true)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.mabelSurface.opacity(0.9))
                            )
                    }
                    .padding(.bottom, 40)

                    // Buttons
                    CTAButton(title: "SAVE") {
                        appState.updateProfile(
                            displayName: displayName.trimmingCharacters(in: .whitespaces),
                            gender: selectedGender
                        )
                        dismiss()
                    }
                    .padding(.bottom, 12)

                    Button(action: { dismiss() }) {
                        Text("HOME")
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelTeal)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
                            )
                    }

                    Spacer()
                        .frame(height: 40)
                }
                .padding(.horizontal, 24)
            }
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
