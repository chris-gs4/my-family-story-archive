import SwiftUI

struct MyStoriesView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false

    private var chaptersWithNarratives: [Chapter] {
        appState.chapters.filter { $0.generatedNarrative != nil }
    }

    var body: some View {
        ZStack {
            MabelGradientBackground()

            if chaptersWithNarratives.isEmpty {
                emptyState
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        // Top bar
                        HStack {
                            Text("My Stories")
                                .font(.comfortaa(22, weight: .bold))
                                .foregroundColor(.mabelText)
                            Spacer()
                            ProfileButton { showProfile = true }
                        }
                        .padding(.top, 16)
                        .padding(.bottom, 24)

                        // Chapter narratives
                        ForEach(chaptersWithNarratives) { chapter in
                            chapterNarrativeCard(chapter)
                                .padding(.bottom, 20)
                        }

                        Spacer()
                            .frame(height: 40)
                    }
                    .padding(.horizontal, 24)
                }
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showProfile) {
            ProfileView()
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image("MabelMascot")
                .resizable()
                .scaledToFit()
                .frame(width: 80, height: 80)

            Text("Your book is taking shape!")
                .font(.comfortaa(18, weight: .bold))
                .foregroundColor(.mabelText)

            Text("Complete a chapter to see your story here.")
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40)
    }

    // MARK: - Chapter Card

    private func chapterNarrativeCard(_ chapter: Chapter) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Chapter \(chapter.id) – \(chapter.title)")
                .font(.comfortaa(18, weight: .bold))
                .foregroundColor(.mabelText)

            if let narrative = chapter.generatedNarrative {
                Text(narrative)
                    .font(.comfortaa(14, weight: .regular))
                    .foregroundColor(.mabelText)
                    .lineSpacing(6)
            }

            // Show individual memory narratives if no combined chapter narrative
            let processedMemories = chapter.memories.filter { $0.narrativeText != nil }
            if chapter.generatedNarrative == nil {
                ForEach(processedMemories) { memory in
                    if let text = memory.narrativeText {
                        Text(text)
                            .font(.comfortaa(14, weight: .regular))
                            .foregroundColor(.mabelText)
                            .lineSpacing(6)
                            .padding(.bottom, 8)
                    }
                }
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(red: 1.0, green: 0.98, blue: 0.95))
        )
    }
}

#Preview {
    NavigationStack {
        MyStoriesView()
            .environment(AppState())
    }
}
