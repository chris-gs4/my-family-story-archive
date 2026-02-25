import SwiftUI

struct LibraryView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false
    @State private var showShareSheet = false
    @State private var pdfURL: URL?
    @State private var isGeneratingPDF = false

    private var allCompleted: Bool {
        appState.completedChapterCount == 10
    }

    var body: some View {
        VStack(spacing: 0) {
                // FIXED top bar (below safe area)
                HStack {
                    MabelWordmark(height: 20)
                    Spacer()
                    ProfileButton { showProfile = true }
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
                .padding(.bottom, 8)

                // Scrollable content
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        if allCompleted {
                            completedBookView
                        } else {
                            activeBookView
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 8)
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
            // Book heading
            Text("\(appState.userProfile?.displayName ?? "Your")'s Book")
                .font(.comfortaa(28, weight: .bold))
                .foregroundColor(.mabelText)
                .padding(.bottom, 8)

            Text("\(appState.completedChapterCount) of 10 chapters completed")
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .padding(.bottom, 12)

            ProgressBar(
                progress: Double(appState.completedChapterCount) / 10.0,
                height: 8
            )
            .padding(.bottom, 24)

            // Featured chapter card
            if let current = appState.currentChapter {
                let chapterIndex = current.id - 1
                NavigationLink(value: chapterIndex) {
                    FeaturedChapterCard(chapter: current)
                }
                .buttonStyle(.plain)
                .padding(.bottom, 24)
            }

            // All chapters heading
            Text("All Chapters")
                .font(.comfortaa(18, weight: .bold))
                .foregroundColor(.mabelText)
                .padding(.bottom, 12)

            // 2-column grid
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                ForEach(appState.chapters) { chapter in
                    NavigationLink(value: chapter.id - 1) {
                        ChapterCard(chapter: chapter)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.bottom, 60)
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
        VStack(spacing: 24) {
            Spacer()
                .frame(height: 40)

            Image(systemName: "book.closed.fill")
                .font(.system(size: 60))
                .foregroundColor(.mabelTeal)

            Text("Congratulations!")
                .font(.comfortaa(28, weight: .bold))
                .foregroundColor(.mabelText)

            Text("You've completed all 10 chapters of your book.")
                .font(.comfortaa(16, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .multilineTextAlignment(.center)

            // PDF Download
            CTAButton(
                title: isGeneratingPDF ? "GENERATING..." : "PDF DOWNLOAD",
                isDisabled: isGeneratingPDF
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

                Text(initial)
                    .font(.comfortaa(16, weight: .bold))
                    .foregroundColor(.mabelText)
            }
        }
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
