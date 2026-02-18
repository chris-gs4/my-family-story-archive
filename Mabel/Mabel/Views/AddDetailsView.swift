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
            ZStack {
                // BACKGROUND
                MabelGradientBackground()

                // CONTENT
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
            }
        }
    }

    // MARK: - Menu View
    private var menuView: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Header
            Text("Add Details")
                .font(.comfortaa(28, weight: .bold))
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
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.mabelSurface.opacity(0.9))
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
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.mabelSurface.opacity(0.9))
                )
            }

            Spacer()

            // Save button
            CTAButton(title: "Save") {
                dismiss()
            }
            .padding(.bottom, 40)
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
                .font(.comfortaa(28, weight: .bold))
                .foregroundColor(.mabelText)

            TextEditor(text: $characterText)
                .font(.comfortaa(16, weight: .regular))
                .foregroundColor(.mabelText)
                .scrollContentBackground(.hidden)
                .frame(minHeight: 200, maxHeight: .infinity)
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.mabelSurface.opacity(0.9))
                )
                .overlay(alignment: .topLeading, content: {
                    if characterText.isEmpty {
                        Text("Describe them — name, how you know them, what they looked like, anything you remember...")
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelSubtle)
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
            .padding(.bottom, 40)
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
                .font(.comfortaa(28, weight: .bold))
                .foregroundColor(.mabelText)

            TextEditor(text: $sceneText)
                .font(.comfortaa(16, weight: .regular))
                .foregroundColor(.mabelText)
                .scrollContentBackground(.hidden)
                .frame(minHeight: 200, maxHeight: .infinity)
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.mabelSurface.opacity(0.9))
                )
                .overlay(alignment: .topLeading, content: {
                    if sceneText.isEmpty {
                        Text("Where were you? What did it feel like? Describe the place, the weather, the mood — anything that brings this memory to life...")
                            .font(.comfortaa(16, weight: .regular))
                            .foregroundColor(.mabelSubtle)
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
            .padding(.bottom, 40)
        }
        .padding(.horizontal, 24)
    }
}

#Preview {
    AddDetailsView(
        story: .constant(StoryEntry.mockEntries[0])
    )
}
