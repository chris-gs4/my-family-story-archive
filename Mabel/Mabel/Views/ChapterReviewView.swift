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

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.mabelSubtle)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                Spacer()
                Text("Review Chapter")
                    .font(.comfortaa(18, weight: .bold))
                    .foregroundColor(.mabelText)
                Spacer()
                // Balance the layout
                Color.clear.frame(width: 44, height: 44)
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)
            .padding(.bottom, 8)

            // Scrollable narrative
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Chapter \(chapter.id) – \(chapter.title)")
                        .font(.comfortaa(20, weight: .bold))
                        .foregroundColor(.mabelText)

                    if let narrative = chapter.generatedNarrative {
                        Text(narrative)
                            .font(.comfortaa(14, weight: .regular))
                            .foregroundColor(.mabelText)
                            .lineSpacing(6)
                    }

                    // Error message
                    if let error = errorMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.mabelBurgundy)
                            Text(error)
                                .font(.comfortaa(12, weight: .regular))
                                .foregroundColor(.mabelBurgundy)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.mabelBurgundy.opacity(0.08))
                        )
                    }

                    // Feedback section
                    if showFeedbackField {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("What would you like to change?")
                                .font(.comfortaa(14, weight: .bold))
                                .foregroundColor(.mabelText)

                            TextEditor(text: $feedback)
                                .font(.comfortaa(14, weight: .regular))
                                .foregroundColor(.mabelText)
                                .scrollContentBackground(.hidden)
                                .padding(12)
                                .frame(minHeight: 100)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.mabelSurface.opacity(0.9))
                                )

                            Text("e.g. \"Make it more emotional\", \"Add more detail about the house\", \"Use a lighter tone\"")
                                .font(.comfortaa(11, weight: .regular))
                                .foregroundColor(.mabelSubtle)
                        }
                    }

                    Spacer().frame(height: 20)
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
            }

            // Bottom actions
            VStack(spacing: 10) {
                if isRegenerating {
                    HStack(spacing: 10) {
                        ProgressView()
                            .tint(.mabelTeal)
                        Text("Rewriting your chapter...")
                            .font(.comfortaa(13, weight: .medium))
                            .foregroundColor(.mabelSubtle)
                    }
                    .padding(.bottom, 8)
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
                            .font(.comfortaa(14, weight: .medium))
                            .foregroundColor(.mabelSubtle)
                    }
                } else {
                    // Approve button
                    CTAButton(title: "APPROVE CHAPTER", isDisabled: isRegenerating) {
                        appState.approveChapter(chapterIndex: chapterIndex)
                        dismiss()
                    }

                    // Request changes button
                    Button(action: { showFeedbackField = true }) {
                        Text("REQUEST CHANGES")
                            .font(.comfortaa(14, weight: .bold))
                            .foregroundColor(.mabelTeal)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(
                                Capsule()
                                    .strokeBorder(Color.mabelTeal, lineWidth: 1.5)
                            )
                    }
                    .disabled(isRegenerating)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
            .padding(.top, 8)
        }
        .background(MabelGradientBackground())
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
