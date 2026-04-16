import SwiftUI

struct ChapterReviewView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    let chapterIndex: Int

    @State private var feedback = ""
    @State private var isRegenerating = false
    @State private var showFeedbackField = false
    @State private var errorMessage: String?

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
                                .lineSpacing(6)
                        }

                        // Error message
                        if let error = errorMessage {
                            HStack(spacing: MabelSpacing.tightGap) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.mabelBurgundy)
                                Text(error)
                                    .font(MabelTypography.smallLabel())
                                    .foregroundColor(.mabelBurgundy)
                            }
                            .padding(MabelSpacing.md)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: MabelSpacing.cornerRadiusBadge)
                                    .fill(Color.mabelBurgundy.opacity(0.08))
                            )
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
                    }

                    Spacer().frame(height: MabelSpacing.cardPaddingContent)
                }
                .screenPadding()
            }

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

                    Button(action: { showFeedbackField = false; feedback = "" }) {
                        Text("Cancel")
                            .font(MabelTypography.helper())
                            .foregroundColor(.mabelSubtle)
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
