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
            // FIXED top bar
            HStack {
                Button(action: { appState.selectedTab = 0 }) {
                    HStack(spacing: MabelSpacing.tightGap) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                        MabelWordmarkLockup()
                    }
                    .foregroundColor(.mabelPrimary)
                    .frame(height: 44)
                    .contentShape(Rectangle())
                }
                Spacer()
                Text("My Stories")
                    .screenTitleStyle()
                Spacer()
                ProfileButton { showProfile = true }
            }
            .padding(.horizontal, MabelSpacing.screenPadH)
            .padding(.top, MabelSpacing.tightGap)
            .padding(.bottom, MabelSpacing.tightGap)

            if chaptersWithNarratives.isEmpty {
                Spacer()
                emptyState
                Spacer()
            } else {
                // Scrollable content
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 0) {
                        // Section label
                        Text("Your Chapters")
                            .sectionLabelStyle()
                            .padding(.top, MabelSpacing.elementGap)
                            .padding(.bottom, MabelSpacing.elementGap)

                        // Chapter narrative cards
                        ForEach(chaptersWithNarratives) { chapter in
                            chapterNarrativeCard(chapter)
                                .padding(.bottom, MabelSpacing.elementGap)
                        }

                        Spacer()
                            .frame(height: MabelSpacing.bottomSafe + MabelSpacing.cardPaddingContent)
                    }
                    .screenPadding()
                }
            }
        }
        .background(
            Color.mabelBackground
                .ignoresSafeArea(.all, edges: .all)
        )
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
        VStack(spacing: MabelSpacing.elementGap) {
            Image("MabelMascot")
                .resizable()
                .scaledToFit()
                .frame(width: MabelSpacing.mascotEmpty, height: MabelSpacing.mascotEmpty)

            Text("Your book is taking shape!")
                .screenTitleStyle()
                .multilineTextAlignment(.center)

            Text("Complete a chapter to see your story here.")
                .helperStyle()
                .multilineTextAlignment(.center)
        }
        .screenPadding()
    }

    // MARK: - Chapter Card

    private func chapterNarrativeCard(_ chapter: Chapter) -> some View {
        VStack(alignment: .leading, spacing: MabelSpacing.md) {
            // Chapter badge + status
            HStack(spacing: MabelSpacing.tightGap) {
                Text("CH. \(chapter.id)")
                    .font(MabelTypography.badge())
                    .foregroundColor(.mabelPrimary)
                    .padding(.horizontal, MabelSpacing.md)
                    .padding(.vertical, MabelSpacing.xs)
                    .background(Capsule().fill(Color.mabelPrimaryLight))

                Text(chapter.title)
                    .font(MabelTypography.screenTitle())
                    .foregroundColor(.mabelText)

                Spacer()

                if chapter.isApproved {
                    Text("APPROVED")
                        .font(MabelTypography.smallLabel())
                        .foregroundColor(.mabelPrimary)
                        .padding(.horizontal, MabelSpacing.tightGap)
                        .padding(.vertical, MabelSpacing.xs)
                        .background(
                            Capsule().fill(Color.mabelPrimary.opacity(0.1))
                        )
                } else if chapter.generatedNarrative != nil {
                    Text("DRAFT")
                        .font(MabelTypography.smallLabel())
                        .foregroundColor(.mabelBurgundy)
                        .padding(.horizontal, MabelSpacing.tightGap)
                        .padding(.vertical, MabelSpacing.xs)
                        .background(
                            Capsule().fill(Color.mabelBurgundy.opacity(0.1))
                        )
                }
            }

            // Narrative text
            if let narrative = chapter.generatedNarrative {
                Text(narrative)
                    .font(MabelTypography.helper())
                    .foregroundColor(.mabelText)
                    .lineSpacing(6)
            }

            // Individual memory narratives if no combined chapter narrative
            let processedMemories = chapter.memories.filter { $0.narrativeText != nil }
            if chapter.generatedNarrative == nil {
                ForEach(processedMemories) { memory in
                    if let text = memory.narrativeText {
                        Text(text)
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelText)
                            .lineSpacing(6)
                            .padding(.bottom, MabelSpacing.tightGap)
                    }
                }
            }

            // Review button for unapproved chapters with narratives
            if chapter.generatedNarrative != nil && !chapter.isApproved {
                CTAButton(title: "REVIEW & APPROVE") {
                    reviewingChapterIndex = chapter.id - 1
                    showChapterReview = true
                }
                .padding(.top, MabelSpacing.xs)
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
    }
}

#Preview {
    NavigationStack {
        MyStoriesView()
            .environment(AppState())
    }
}
