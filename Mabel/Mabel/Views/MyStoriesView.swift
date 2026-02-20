import SwiftUI

struct MyStoriesView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false
    @State private var showChapterReview = false
    @State private var reviewingChapterIndex: Int = 0

    private var chaptersWithNarratives: [Chapter] {
        appState.chapters.filter { chapter in
            chapter.generatedNarrative != nil ||
            chapter.memories.contains { $0.narrativeText != nil }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
                // FIXED top bar (below safe area)
                HStack {
                    Button(action: { appState.selectedTab = 0 }) {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                            Text("Home")
                                .font(.comfortaa(14, weight: .medium))
                        }
                        .foregroundColor(.mabelTeal)
                        .frame(height: 44)
                        .contentShape(Rectangle())
                    }
                    Spacer()
                    Text("My Stories")
                        .font(.comfortaa(18, weight: .bold))
                        .foregroundColor(.mabelText)
                    Spacer()
                    ProfileButton { showProfile = true }
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
                .padding(.bottom, 8)

                if chaptersWithNarratives.isEmpty {
                    Spacer()
                    emptyState
                    Spacer()
                } else {
                    // Scrollable content
                    ScrollView {
                        VStack(alignment: .leading, spacing: 0) {
                            // Chapter narratives
                            ForEach(chaptersWithNarratives) { chapter in
                                chapterNarrativeCard(chapter)
                                    .padding(.bottom, 20)
                            }

                            Spacer()
                                .frame(height: 60)
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 8)
                    }
                }
        }
        .background(MabelGradientBackground())
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showProfile) {
            ProfileView()
        }
        .sheet(isPresented: $showChapterReview) {
            ChapterReviewView(chapterIndex: reviewingChapterIndex)
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
            HStack {
                Text("Chapter \(chapter.id) – \(chapter.title)")
                    .font(.comfortaa(18, weight: .bold))
                    .foregroundColor(.mabelText)
                Spacer()
                if chapter.isApproved {
                    Text("Approved")
                        .font(.comfortaa(11, weight: .bold))
                        .foregroundColor(.mabelTeal)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(
                            Capsule().fill(Color.mabelTeal.opacity(0.12))
                        )
                } else if chapter.generatedNarrative != nil {
                    Text("Draft")
                        .font(.comfortaa(11, weight: .bold))
                        .foregroundColor(.mabelBurgundy)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(
                            Capsule().fill(Color.mabelBurgundy.opacity(0.1))
                        )
                }
            }

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

            // Review button for unapproved chapters with narratives
            if chapter.generatedNarrative != nil && !chapter.isApproved {
                Button(action: {
                    reviewingChapterIndex = chapter.id - 1
                    showChapterReview = true
                }) {
                    Text("REVIEW & APPROVE")
                        .font(.comfortaa(12, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background(
                            Capsule().fill(Color.mabelTeal)
                        )
                }
                .padding(.top, 4)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Color.mabelText.opacity(0.15), lineWidth: 1)
        )
    }
}

#Preview {
    NavigationStack {
        MyStoriesView()
            .environment(AppState())
    }
}
