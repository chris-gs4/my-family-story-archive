import SwiftUI

struct SavedStoriesView: View {
    @Binding var stories: [StoryEntry]
    let onNewRecording: () -> Void

    @State private var selectedStory: StoryEntry?
    @State private var isShowingAddDetails = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            // BACKGROUND — fills entire screen
            MabelGradientBackground()

            // CONTENT — vertical ScrollView of StoryCards
            ScrollView {
                VStack(spacing: 20) {
                    // Wordmark IMAGE centered
                    Image("MabelWordmark")
                        .renderingMode(.original)
                        .resizable()
                        .scaledToFit()
                        .frame(height: 24)
                        .padding(.top, 16)

                    // Section header
                    HStack {
                        Text("Your Stories")
                            .font(.comfortaa(28, weight: .bold))
                            .foregroundColor(.mabelText)
                        Spacer()
                    }

                    if stories.isEmpty {
                        // Empty state — mascot at 80pt with text
                        VStack(spacing: 16) {
                            Spacer()
                                .frame(height: 40)
                            Image("MabelMascot")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 80, height: 80)
                            Text("No stories yet")
                                .font(.comfortaa(18, weight: .medium))
                                .foregroundColor(.mabelSubtle)
                            Text("Tap + to start recording.")
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelSubtle)
                                .multilineTextAlignment(.center)
                        }
                    } else {
                        // Story cards — continuous scrollable list
                        ForEach(stories) { story in
                            StoryCard(
                                entry: story,
                                onReadMore: {
                                    // Future: open full story view
                                },
                                onAddDetails: {
                                    selectedStory = story
                                    isShowingAddDetails = true
                                }
                            )
                        }
                    }

                    // Bottom spacing for FAB
                    Spacer()
                        .frame(height: 80)
                }
                .padding(.horizontal, 24)
            }

            // Floating action button — bottom-right, 56pt circle, teal, "+" icon
            Button(action: onNewRecording) {
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 56, height: 56)
                    .background(
                        Circle()
                            .fill(Color.mabelTeal)
                            .shadow(color: Color.mabelTeal.opacity(0.4), radius: 8, x: 0, y: 4)
                    )
            }
            .padding(.trailing, 24)
            .padding(.bottom, 40)
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $isShowingAddDetails) {
            if let story = selectedStory,
               let index = stories.firstIndex(where: { $0.id == story.id }) {
                AddDetailsView(story: $stories[index])
            }
        }
    }
}

#Preview {
    NavigationStack {
        SavedStoriesView(
            stories: .constant(StoryEntry.mockEntries),
            onNewRecording: {}
        )
    }
}
