import SwiftUI

struct LibraryView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false
    @State private var showShareSheet = false
    @State private var pdfURL: URL?
    @State private var isGeneratingPDF = false

    private var allCompleted: Bool {
        appState.completedChapterCount == Chapter.totalChapters
    }

    private var hasApprovedChapters: Bool {
        appState.chapters.contains { $0.isApproved && $0.generatedNarrative != nil }
    }

    var body: some View {
        VStack(spacing: 0) {
            // FIXED top bar (below safe area)
            HStack {
                MabelWordmark()
                Spacer()
                ProfileButton { showProfile = true }
            }
            .padding(.horizontal, MabelSpacing.screenPadH)
            .padding(.top, MabelSpacing.tightGap)
            .padding(.bottom, MabelSpacing.tightGap)

            // Scrollable content
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    if allCompleted {
                        completedBookView
                    } else {
                        activeBookView
                    }
                }
                .screenPadding()
                .padding(.top, MabelSpacing.tightGap)
            }
        }
        .background(MabelGradientBackground())
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showProfile) {
            ProfileView()
        }
        .sheet(isPresented: $showShareSheet) {
            if let pdfURL {
                ShareSheet(activityItems: [pdfURL])
            }
        }
    }

    // MARK: - Active Book View

    private var activeBookView: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Greeting header
            MascotGreetingHeader(userName: appState.userProfile?.displayName ?? "Friend")
                .padding(.bottom, MabelSpacing.xl)

            // Continue Your Story — hero FeaturedChapterCard
            if let current = appState.currentChapter {
                VStack(alignment: .leading, spacing: MabelSpacing.md) {
                    Text("Continue Your Story")
                        .sectionLabelStyle()

                    NavigationLink(value: current.id - 1) {
                        FeaturedChapterCard(chapter: current)
                    }
                    .buttonStyle(ChapterCardButtonStyle())
                }
                .padding(.bottom, MabelSpacing.sectionGap)
            }

            // Today's prompt
            if let current = appState.currentChapter {
                let prompt = ChapterPrompts.getTodayPrompt(for: current.id)
                PromptCard(
                    title: prompt.title,
                    description: prompt.description,
                    emoji: prompt.emoji
                ) {
                    appState.navigationPath.append(current.id - 1)
                }
                .padding(.bottom, MabelSpacing.sectionGap)
            }

            // Your Progress
            Text("Your Progress")
                .sectionLabelStyle()
                .padding(.bottom, MabelSpacing.md)

            ProgressCard(
                chapters: appState.chapters,
                currentChapterID: appState.currentChapter?.id
            )
            .padding(.bottom, MabelSpacing.sectionGap)

            // All Chapters
            Text("All Chapters")
                .sectionLabelStyle()
                .padding(.bottom, MabelSpacing.md)

            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: MabelSpacing.md),
                GridItem(.flexible(), spacing: MabelSpacing.md)
            ], spacing: MabelSpacing.md) {
                ForEach(appState.chapters) { chapter in
                    NavigationLink(value: chapter.id - 1) {
                        ChapterCard(chapter: chapter)
                    }
                    .buttonStyle(ChapterCardButtonStyle())
                }
            }
            .padding(.bottom, MabelSpacing.bottomSafe + MabelSpacing.cardPaddingContent)
        }
    }

    // MARK: - PDF Export

    private func generateAndSharePDF() {
        isGeneratingPDF = true
        let name = appState.userProfile?.displayName ?? "Your"
        let bookTitle = "\(name)'s Book"

        DispatchQueue.global(qos: .userInitiated).async {
            let url = PDFExportService.generateBookPDF(
                title: bookTitle,
                authorName: name,
                chapters: appState.chapters
            )
            DispatchQueue.main.async {
                isGeneratingPDF = false
                if let url {
                    pdfURL = url
                    showShareSheet = true
                }
            }
        }
    }

    // MARK: - Completed Book View

    private var completedBookView: some View {
        VStack(spacing: MabelSpacing.xl) {
            Spacer()
                .frame(height: MabelSpacing.xxxl)

            Image(systemName: "book.closed.fill")
                .font(.system(size: 60))
                .foregroundColor(.mabelPrimary)

            Text("Congratulations!")
                .headingStyle()

            Text("You've completed all \(Chapter.totalChapters) chapters of your book.")
                .font(MabelTypography.body())
                .foregroundColor(.mabelSubtle)
                .multilineTextAlignment(.center)

            // PDF Download
            CTAButton(
                title: isGeneratingPDF ? "GENERATING..." : (hasApprovedChapters ? "PDF DOWNLOAD" : "NO CHAPTERS READY"),
                isDisabled: isGeneratingPDF || !hasApprovedChapters
            ) {
                generateAndSharePDF()
            }

            // Audiobook (grayed out)
            CTAButton(title: "AUDIOBOOK", isDisabled: true) {}

            Spacer()
        }
    }
}

// MARK: - Profile Button

struct ProfileButton: View {
    @Environment(AppState.self) private var appState
    let action: () -> Void

    private var initial: String {
        guard let name = appState.userProfile?.displayName, !name.isEmpty else { return "?" }
        return String(name.prefix(1)).uppercased()
    }

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(Color.mabelSurface)
                    .frame(width: 36, height: 36)
                    .overlay(
                        Circle()
                            .strokeBorder(Color.mabelPrimary.opacity(0.2), lineWidth: MabelSpacing.borderCard)
                    )
                    .shadow(color: .black.opacity(0.08), radius: 4, x: 0, y: 2)

                Text(initial)
                    .font(MabelTypography.progress())
                    .foregroundColor(.mabelText)
            }
        }
        .buttonStyle(ProfileButtonStyle())
    }
}

// MARK: - Profile Button Style

struct ProfileButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.9 : 1.0)
            .shadow(
                color: configuration.isPressed ? .black.opacity(0.12) : .clear,
                radius: configuration.isPressed ? 6 : 0,
                x: 0,
                y: configuration.isPressed ? 3 : 0
            )
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    NavigationStack {
        LibraryView()
            .environment(AppState())
    }
}
