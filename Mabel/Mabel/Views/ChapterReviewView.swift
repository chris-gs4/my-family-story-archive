import SwiftUI

struct ChapterReviewView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    let chapterIndex: Int

    /// When `true`, the sheet opens with the feedback field already visible
    /// (and auto-scrolls to it). Set by callers that already represent the
    /// "I want to request changes" intent — e.g. MyStoriesView's REQUEST
    /// CHANGES button on an already-approved chapter, where re-clicking
    /// REQUEST CHANGES inside the sheet would be a redundant second tap.
    let openInFeedbackMode: Bool

    @State private var feedback = ""
    @State private var isRegenerating = false
    @State private var showFeedbackField: Bool
    @State private var errorMessage: String?

    private let feedbackSectionID = "chapterReviewFeedbackSection"

    init(chapterIndex: Int, openInFeedbackMode: Bool = false) {
        self.chapterIndex = chapterIndex
        self.openInFeedbackMode = openInFeedbackMode
        self._showFeedbackField = State(initialValue: openInFeedbackMode)
    }

    private var chapter: Chapter {
        guard chapterIndex >= 0, chapterIndex < appState.chapters.count else {
            return Chapter.allChapters[0]
        }
        return appState.chapters[chapterIndex]
    }

    private var statusBadgeText: String? {
        if chapter.isApproved { return "APPROVED" }
        if chapter.generatedNarrative != nil { return "DRAFT" }
        return nil
    }

    private var statusBadgeColor: Color {
        chapter.isApproved ? .mabelPrimary : .mabelBurgundy
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
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
                Spacer()
                MabelWordmarkLockup()
                Spacer()
                Color.clear.frame(width: 44, height: 44)
            }
            .padding(.horizontal, MabelSpacing.screenPadH)
            .topSafePadding()
            .padding(.bottom, MabelSpacing.tightGap)

            // Scrollable content
            // ScrollViewReader gives us a proxy so we can scrollTo the
            // feedback section when it appears — otherwise the user lands
            // at the top of a long narrative and has to scroll to find the
            // input field (Phase 1.9 follow-up, surfaced 2026-05-27).
            ScrollViewReader { proxy in
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    // Chapter badge + status
                    HStack(spacing: MabelSpacing.tightGap) {
                        Text("CH. \(chapter.id)")
                            .font(MabelTypography.badge())
                            .foregroundColor(.mabelPrimary)
                            .padding(.horizontal, MabelSpacing.md)
                            .padding(.vertical, MabelSpacing.xs)
                            .background(Capsule().fill(Color.mabelPrimaryLight))

                        Text(chapter.title)
                            .subheadingStyle()

                        Spacer()

                        if let badgeText = statusBadgeText {
                            Text(badgeText)
                                .font(MabelTypography.smallLabel())
                                .foregroundColor(statusBadgeColor)
                                .padding(.horizontal, MabelSpacing.tightGap)
                                .padding(.vertical, MabelSpacing.xs)
                                .background(
                                    Capsule().fill(statusBadgeColor.opacity(0.1))
                                )
                        }
                    }
                    .padding(.top, MabelSpacing.elementGap)
                    .padding(.bottom, MabelSpacing.xl)

                    // Narrative card — the "page"
                    VStack(alignment: .leading, spacing: MabelSpacing.elementGap) {
                        Text("Chapter \(chapter.id) \u{2013} \(chapter.title)")
                            .font(MabelTypography.storyTitle())
                            .foregroundColor(.mabelText)

                        if let narrative = chapter.generatedNarrative {
                            Text(narrative)
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelText)
                                .lineSpacing(10)
                        }

                        // Phase 1.1: regeneration errors were inline here and easy
                        // to miss while scrolling a long narrative. Promoted to
                        // `.alert()` at the view level — see modifier below.
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

                    // Feedback section
                    if showFeedbackField {
                        VStack(alignment: .leading, spacing: MabelSpacing.tightGap) {
                            Text("What would you like to change?")
                                .formLabelStyle()

                            TextEditor(text: $feedback)
                                .font(MabelTypography.helper())
                                .foregroundColor(.mabelText)
                                .scrollContentBackground(.hidden)
                                .padding(MabelSpacing.md)
                                .frame(minHeight: 100)
                                .background(
                                    RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusPill)
                                        .fill(Color.mabelBackgroundAlt)
                                )

                            Text("e.g. \"Make it more emotional\", \"Add more detail about the house\", \"Use a lighter tone\"")
                                .font(MabelTypography.smallLabel())
                                .foregroundColor(.mabelSubtle)
                        }
                        .padding(.bottom, MabelSpacing.xl)
                        .id(feedbackSectionID)
                    }

                    Spacer().frame(height: MabelSpacing.cardPaddingContent)
                }
                .screenPadding()
            }
            .onAppear {
                // Sheet just opened in feedback mode (came from MyStories'
                // approved-chapter REQUEST CHANGES). Wait one beat for the
                // sheet's slide-up animation to settle, then bring the
                // feedback section to the top of the visible area.
                guard openInFeedbackMode else { return }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    withAnimation(.easeOut(duration: 0.25)) {
                        proxy.scrollTo(feedbackSectionID, anchor: .top)
                    }
                }
            }
            .onChange(of: showFeedbackField) { _, isNowVisible in
                // Covers the draft-chapter path: user tapped REQUEST CHANGES
                // inside the sheet, field appeared at the bottom of the
                // narrative, scroll there so they don't have to hunt.
                guard isNowVisible else { return }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    withAnimation(.easeOut(duration: 0.25)) {
                        proxy.scrollTo(feedbackSectionID, anchor: .top)
                    }
                }
            }
            } // end ScrollViewReader

            // Bottom actions
            VStack(spacing: MabelSpacing.pillPadV) {
                if isRegenerating {
                    HStack(spacing: MabelSpacing.pillPadV) {
                        ProgressView()
                            .tint(.mabelPrimary)
                        Text("Rewriting your chapter...")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                    }
                    .padding(.bottom, MabelSpacing.tightGap)
                }

                if showFeedbackField {
                    CTAButton(
                        title: "REGENERATE",
                        isDisabled: feedback.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isRegenerating
                    ) {
                        regenerateNarrative()
                    }

                    Button(action: {
                        // Phase 1.9 follow-up: when the sheet was opened
                        // directly in feedback mode (from MyStories' REQUEST
                        // CHANGES on an approved chapter), Cancel should
                        // dismiss the sheet entirely — toggling back to the
                        // default state would just show another REQUEST
                        // CHANGES button, leaving the user circling. For the
                        // draft-chapter path, Cancel still reverts to the
                        // APPROVE + REQUEST CHANGES default.
                        if openInFeedbackMode {
                            dismiss()
                        } else {
                            showFeedbackField = false
                            feedback = ""
                        }
                    }) {
                        Text("Cancel")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
                    }
                } else if chapter.isApproved {
                    // Phase 1.9: re-entry from MyStoriesView for an already-approved
                    // chapter. The APPROVE CTA is a no-op here, so hide it; only
                    // REQUEST CHANGES is meaningful. Dismiss is via the X in the
                    // header. Tapping REQUEST CHANGES → feedback → REGENERATE will
                    // revoke approval through `updateNarrative()` and put the
                    // chapter back into the draft flow until re-approved.
                    CTAButton(title: "REQUEST CHANGES", isDisabled: isRegenerating) {
                        showFeedbackField = true
                    }
                } else {
                    CTAButton(title: "APPROVE CHAPTER", isDisabled: isRegenerating) {
                        appState.approveChapter(chapterIndex: chapterIndex)
                        dismiss()
                    }

                    SecondaryButton(title: "REQUEST CHANGES", isDisabled: isRegenerating) {
                        showFeedbackField = true
                    }
                }
            }
            .screenPadding()
            .bottomSafePadding()
            .padding(.top, MabelSpacing.tightGap)
        }
        .background(
            Color.mabelBackground
                .ignoresSafeArea(.all, edges: .all)
        )
        .alert(
            "Couldn't regenerate chapter",
            isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )
        ) {
            Button("Try again") {
                regenerateNarrative()
            }
            Button("Dismiss", role: .cancel) { }
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private func regenerateNarrative() {
        let trimmedFeedback = feedback.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedFeedback.isEmpty else { return }

        isRegenerating = true
        errorMessage = nil

        let memoryNarratives = chapter.memories.compactMap { $0.narrativeText }
        let currentNarrative = chapter.generatedNarrative ?? ""
        let userName = appState.userProfile?.displayName ?? "Narrator"

        Task {
            do {
                let newNarrative = try await OpenAIService.shared.regenerateChapterNarrative(
                    currentNarrative: currentNarrative,
                    feedback: trimmedFeedback,
                    memories: memoryNarratives,
                    chapterTitle: chapter.title,
                    chapterTopic: chapter.topic,
                    userName: userName
                )
                appState.updateNarrative(chapterIndex: chapterIndex, text: newNarrative)
                feedback = ""
                showFeedbackField = false
                isRegenerating = false
            } catch {
                errorMessage = error.localizedDescription
                isRegenerating = false
            }
        }
    }
}

#Preview {
    ChapterReviewView(chapterIndex: 0)
        .environment(AppState())
}
