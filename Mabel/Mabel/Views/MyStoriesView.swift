import SwiftUI

private struct ReviewingChapter: Identifiable {
    let id: Int  // chapter index in appState.chapters
}

struct MyStoriesView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false
    @State private var reviewingChapter: ReviewingChapter?

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
        .sheet(item: $reviewingChapter) { reviewing in
            ChapterReviewView(chapterIndex: reviewing.id)
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

            // Narrative text — rendered with book-style typography: justified alignment,
            // automatic hyphenation (reduces "rivers" on narrow phone columns), 16pt
            // Comfortaa (the design system's actual body minimum — helper() at 14pt was
            // too small for an extended read). See MyStoriesView.bookStyle(_:).
            if let narrative = chapter.generatedNarrative {
                Text(MyStoriesView.bookStyle(narrative))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Individual memory narratives if no combined chapter narrative
            let processedMemories = chapter.memories.filter { $0.narrativeText != nil }
            if chapter.generatedNarrative == nil {
                ForEach(processedMemories) { memory in
                    if let text = memory.narrativeText {
                        Text(MyStoriesView.bookStyle(text))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.bottom, MabelSpacing.tightGap)
                    }
                }
            }

            // Review button for unapproved chapters with narratives
            if chapter.generatedNarrative != nil && !chapter.isApproved {
                CTAButton(title: "REVIEW & APPROVE") {
                    reviewingChapter = ReviewingChapter(id: chapter.id - 1)
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

    // MARK: - Book-style typography
    //
    // Wraps a chapter / memory narrative in an `AttributedString` carrying a paragraph
    // style with `.justified` alignment, automatic hyphenation, generous line spacing,
    // and inter-paragraph breathing room. `Text` doesn't expose justified alignment
    // through `.multilineTextAlignment`, so the NSAttributedString detour is the
    // shortest path. Hyphenation matters: justified text on a phone-width column
    // produces ugly "rivers" of whitespace without it.

    static func bookStyle(_ text: String) -> AttributedString {
        let attributed = NSMutableAttributedString(string: text)
        let style = NSMutableParagraphStyle()
        style.alignment = .justified
        style.lineSpacing = 6
        style.paragraphSpacing = 14
        style.hyphenationFactor = 1.0

        let range = NSRange(location: 0, length: attributed.length)
        attributed.addAttribute(.paragraphStyle, value: style, range: range)
        attributed.addAttribute(.font, value: UIFont.comfortaa(16, weight: .regular), range: range)
        attributed.addAttribute(.foregroundColor, value: UIColor(Color.mabelText), range: range)

        return AttributedString(attributed)
    }
}

#Preview {
    NavigationStack {
        MyStoriesView()
            .environment(AppState())
    }
}
