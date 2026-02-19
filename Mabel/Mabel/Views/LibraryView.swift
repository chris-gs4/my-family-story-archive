import SwiftUI

struct LibraryView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false

    private var allCompleted: Bool {
        appState.completedChapterCount == 10
    }

    var body: some View {
        ZStack {
            MabelGradientBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Top bar
                    HStack {
                        MabelWordmark(height: 20)
                        Spacer()
                        ProfileButton { showProfile = true }
                    }
                    .padding(.top, 16)
                    .padding(.bottom, 24)

                    if allCompleted {
                        completedBookView
                    } else {
                        activeBookView
                    }
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showProfile) {
            ProfileView()
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
                    FeaturedChapterCard(chapter: current, action: {})
                        .allowsHitTesting(false)
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
                        ChapterCard(chapter: chapter, action: {})
                            .allowsHitTesting(false)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.bottom, 40)
        }
        .navigationDestination(for: Int.self) { chapterIndex in
            RecordingSetupView(chapterIndex: chapterIndex)
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

            // PDF Download (non-functional for MVP)
            CTAButton(title: "PDF DOWNLOAD") {
                // Non-functional for MVP
            }

            // Audiobook (grayed out)
            CTAButton(title: "AUDIOBOOK", isDisabled: true) {}

            Spacer()
        }
    }
}

// MARK: - Profile Button

struct ProfileButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(Color.mabelSurface)
                    .frame(width: 36, height: 36)

                Text("P")
                    .font(.comfortaa(16, weight: .bold))
                    .foregroundColor(.mabelText)
            }
        }
    }
}

#Preview {
    NavigationStack {
        LibraryView()
            .environment(AppState())
    }
}
