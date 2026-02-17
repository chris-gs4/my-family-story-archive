import SwiftUI

struct SavedStoriesView: View {
    @Binding var stories: [StoryEntry]
    let onNewRecording: () -> Void

    @State private var selectedStory: StoryEntry?
    @State private var isShowingAddDetails = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollView {
                VStack(spacing: 20) {
                    // Wordmark
                    MabelWordmark(height: scaled(26))
                        .padding(.top, 12)

                    // Section header
                    HStack {
                        Text("Your Stories")
                            .font(.comfortaa(scaled(24), weight: .bold))
                            .foregroundColor(.mabelText)
                        Spacer()
                    }

                    if stories.isEmpty {
                        // Empty state
                        VStack(spacing: 16) {
                            Spacer()
                                .frame(height: 40)
                            Image(systemName: "book.closed")
                                .font(.system(size: 48))
                                .foregroundColor(.mabelSubtle.opacity(0.5))
                            Text("No stories yet")
                                .font(.comfortaa(18, weight: .medium))
                                .foregroundColor(.mabelSubtle)
                            Text("Tap the + button to record your first memory")
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelSubtle.opacity(0.8))
                                .multilineTextAlignment(.center)
                        }
                    } else {
                        // Story cards
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

            // Floating action button
            Button(action: onNewRecording) {
                Image(systemName: "plus")
                    .font(.system(size: scaled(24), weight: .semibold))
                    .foregroundColor(.mabelBackground)
                    .frame(width: scaled(56), height: scaled(56))
                    .background(
                        Circle()
                            .fill(Color.mabelTeal)
                            .shadow(color: Color.mabelTeal.opacity(0.4), radius: 8, x: 0, y: 4)
                    )
            }
            .padding(.trailing, 24)
            .padding(.bottom, 24)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.mabelBackground.ignoresSafeArea())
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
