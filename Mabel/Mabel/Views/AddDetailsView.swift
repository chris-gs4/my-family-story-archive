import SwiftUI

struct AddDetailsView: View {
    @Binding var story: StoryEntry
    @Environment(\.dismiss) private var dismiss

    enum DetailScreen: Hashable {
        case menu
        case addCharacter
        case addDetails
    }

    @State private var currentScreen: DetailScreen = .menu
    @State private var characterText: String = ""
    @State private var sceneText: String = ""

    var body: some View {
        NavigationStack {
            Group {
                switch currentScreen {
                case .menu:
                    menuView
                case .addCharacter:
                    addCharacterView
                case .addDetails:
                    addSceneView
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.mabelBackground.ignoresSafeArea())
        }
    }

    // MARK: - Menu View
    private var menuView: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Header
            Text("Add Details")
                .font(.comfortaa(scaled(24), weight: .bold))
                .foregroundColor(.mabelText)
                .padding(.top, 24)

            Text("Help us craft a better story by describing at least one of the following:")
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .lineSpacing(3)

            Spacer()
                .frame(height: 8)

            // Add Character card
            Button(action: {
                characterText = story.characters
                withAnimation(.easeInOut(duration: 0.25)) {
                    currentScreen = .addCharacter
                }
            }) {
                HStack {
                    Text("+ Add Character")
                        .font(.comfortaa(16, weight: .bold))
                        .foregroundColor(.mabelText)
                    Spacer()
                    if !story.characters.isEmpty {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.mabelTeal)
                    }
                    Image(systemName: "chevron.right")
                        .foregroundColor(.mabelSubtle)
                }
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color.mabelSubtle.opacity(0.2), lineWidth: 1)
                )
            }

            // Add Details card
            Button(action: {
                sceneText = story.sceneDetails
                withAnimation(.easeInOut(duration: 0.25)) {
                    currentScreen = .addDetails
                }
            }) {
                HStack {
                    Text("+ Add Details")
                        .font(.comfortaa(16, weight: .bold))
                        .foregroundColor(.mabelText)
                    Spacer()
                    if !story.sceneDetails.isEmpty {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.mabelTeal)
                    }
                    Image(systemName: "chevron.right")
                        .foregroundColor(.mabelSubtle)
                }
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color.mabelSubtle.opacity(0.2), lineWidth: 1)
                )
            }

            Spacer()

            // Save button
            CTAButton(title: "Save") {
                dismiss()
            }
            .padding(.bottom, 24)
        }
        .padding(.horizontal, 24)
    }

    // MARK: - Add Character View
    private var addCharacterView: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Back button
            Button(action: {
                withAnimation(.easeInOut(duration: 0.25)) {
                    currentScreen = .menu
                }
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .font(.comfortaa(14, weight: .medium))
                .foregroundColor(.mabelTeal)
            }
            .padding(.top, 16)

            Text("Who's in this story?")
                .font(.comfortaa(22, weight: .bold))
                .foregroundColor(.mabelText)

            TextEditor(text: $characterText)
                .font(.comfortaa(15, weight: .regular))
                .foregroundColor(.mabelText)
                .scrollContentBackground(.hidden)
                .frame(maxHeight: .infinity)
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color.mabelSubtle.opacity(0.2), lineWidth: 1)
                )
                .overlay(alignment: .topLeading, content: {
                    if characterText.isEmpty {
                        Text("Describe them — name, how you know them, what they looked like, anything you remember...")
                            .font(.comfortaa(14, weight: .regular))
                            .foregroundColor(.mabelSubtle.opacity(0.6))
                            .padding(20)
                            .allowsHitTesting(false)
                    }
                })

            CTAButton(title: "Save") {
                story.characters = characterText
                withAnimation(.easeInOut(duration: 0.25)) {
                    currentScreen = .menu
                }
            }
            .padding(.bottom, 24)
        }
        .padding(.horizontal, 24)
    }

    // MARK: - Add Scene Details View
    private var addSceneView: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Back button
            Button(action: {
                withAnimation(.easeInOut(duration: 0.25)) {
                    currentScreen = .menu
                }
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text("Back")
                }
                .font(.comfortaa(14, weight: .medium))
                .foregroundColor(.mabelTeal)
            }
            .padding(.top, 16)

            Text("Set the Scene")
                .font(.comfortaa(22, weight: .bold))
                .foregroundColor(.mabelText)

            TextEditor(text: $sceneText)
                .font(.comfortaa(15, weight: .regular))
                .foregroundColor(.mabelText)
                .scrollContentBackground(.hidden)
                .frame(maxHeight: .infinity)
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color.mabelSubtle.opacity(0.2), lineWidth: 1)
                )
                .overlay(alignment: .topLeading, content: {
                    if sceneText.isEmpty {
                        Text("Where were you? What did it feel like? Describe the place, the weather, the mood...")
                            .font(.comfortaa(14, weight: .regular))
                            .foregroundColor(.mabelSubtle.opacity(0.6))
                            .padding(20)
                            .allowsHitTesting(false)
                    }
                })

            CTAButton(title: "Save") {
                story.sceneDetails = sceneText
                withAnimation(.easeInOut(duration: 0.25)) {
                    currentScreen = .menu
                }
            }
            .padding(.bottom, 24)
        }
        .padding(.horizontal, 24)
    }
}

#Preview {
    AddDetailsView(
        story: .constant(StoryEntry.mockEntries[0])
    )
}
