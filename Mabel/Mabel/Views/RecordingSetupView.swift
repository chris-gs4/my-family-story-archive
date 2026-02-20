import SwiftUI

struct RecordingSetupView: View {
    @Environment(AppState.self) private var appState
    let chapterIndex: Int
    @State private var showWriteBox = false
    @State private var typedEntry = ""
    @State private var suggestionPrompts: [String] = []
    @State private var showProfile = false

    private var chapter: Chapter {
        guard chapterIndex >= 0, chapterIndex < appState.chapters.count else {
            return Chapter.allChapters[0]
        }
        return appState.chapters[chapterIndex]
    }

    var body: some View {
        VStack(spacing: 0) {
                // FIXED top bar (below safe area)
                HStack {
                    Button(action: {
                        if !appState.navigationPath.isEmpty {
                            appState.navigationPath.removeLast()
                        }
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.mabelTeal)
                            MabelWordmark(height: 20)
                        }
                        .frame(height: 44)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    Spacer()
                    ProfileButton { showProfile = true }
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
                .padding(.bottom, 8)

                // Scrollable content
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        // Chapter heading
                        Text("Chapter \(chapter.id) – \(chapter.title)")
                            .font(.comfortaa(22, weight: .bold))
                            .foregroundColor(.mabelText)
                            .padding(.top, 16)
                            .padding(.bottom, 8)

                        Text("\(chapter.completedMemoryCount) of 5 memories recorded")
                            .font(.comfortaa(14, weight: .regular))
                            .foregroundColor(.mabelSubtle)
                            .padding(.bottom, 12)

                        ProgressBar(
                            progress: Double(chapter.completedMemoryCount) / 5.0,
                            height: 6
                        )
                        .padding(.bottom, 32)

                        if chapter.completedMemoryCount >= 5 {
                            // MARK: - Chapter Complete State
                            chapterCompleteView
                        } else {
                            // MARK: - Recording UI
                            recordingUI
                        }

                        Spacer()
                            .frame(height: 40)
                    }
                    .padding(.horizontal, 24)
                }
        }
        .background(MabelGradientBackground())
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: RecordingDestination.self) { dest in
            RecordingView(chapterIndex: dest.chapterIndex, prompt: dest.prompt)
        }
        .sheet(isPresented: $showProfile) {
            ProfileView()
        }
        .onAppear {
            if suggestionPrompts.isEmpty {
                suggestionPrompts = ChapterPrompts.getPrompts(for: chapter.id, count: 3)
            }
        }
    }

    // MARK: - Chapter Complete View

    private var chapterCompleteView: some View {
        VStack(spacing: 20) {
            // Processing indicator
            if chapter.memories.contains(where: { $0.state == .processing }) {
                HStack(spacing: 10) {
                    ProgressView()
                        .tint(.mabelTeal)
                    Text("Processing your memories...")
                        .font(.comfortaa(13, weight: .medium))
                        .foregroundColor(.mabelSubtle)
                }
                .padding(14)
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.mabelSurface.opacity(0.9))
                )
            }

            // Error indicator
            if let failedMemory = chapter.memories.first(where: { $0.state == .failed }) {
                HStack(spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.mabelBurgundy)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Processing failed")
                            .font(.comfortaa(13, weight: .bold))
                            .foregroundColor(.mabelText)
                        Text(failedMemory.errorMessage ?? "An error occurred.")
                            .font(.comfortaa(11, weight: .regular))
                            .foregroundColor(.mabelSubtle)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.mabelBurgundy.opacity(0.08))
                )
            }

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(.mabelTeal)
                .padding(.top, 20)

            Text("Chapter complete!")
                .font(.comfortaa(22, weight: .bold))
                .foregroundColor(.mabelText)

            Text("All 5 memories have been recorded. Your stories are being woven into a narrative.")
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .multilineTextAlignment(.center)

            CTAButton(title: "VIEW IN MY STORIES") {
                appState.navigationPath = NavigationPath()
                appState.selectedTab = 1
            }
        }
        .padding(.top, 16)
    }

    // MARK: - Recording UI

    private var recordingUI: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Processing indicator
            if chapter.memories.contains(where: { $0.state == .processing }) {
                HStack(spacing: 10) {
                    ProgressView()
                        .tint(.mabelTeal)
                    Text("Processing your memory...")
                        .font(.comfortaa(13, weight: .medium))
                        .foregroundColor(.mabelSubtle)
                }
                .padding(14)
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.mabelSurface.opacity(0.9))
                )
                .padding(.bottom, 16)
            }

            // Error indicator
            if let failedMemory = chapter.memories.first(where: { $0.state == .failed }) {
                HStack(spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.mabelBurgundy)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Processing failed")
                            .font(.comfortaa(13, weight: .bold))
                            .foregroundColor(.mabelText)
                        Text(failedMemory.errorMessage ?? "An error occurred. Please try again.")
                            .font(.comfortaa(11, weight: .regular))
                            .foregroundColor(.mabelSubtle)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.mabelBurgundy.opacity(0.08))
                )
                .padding(.bottom, 16)
            }

            // Mic button — centered
            HStack {
                Spacer()
                NavigationLink(value: RecordingDestination(chapterIndex: chapterIndex, prompt: nil)) {
                    ZStack {
                        Circle()
                            .fill(Color.mabelTeal.opacity(0.08))
                            .frame(width: 112, height: 112)
                        Circle()
                            .fill(Color.mabelTeal)
                            .frame(width: 80, height: 80)
                            .shadow(color: .mabelTeal.opacity(0.3), radius: 10, x: 0, y: 4)
                        Image(systemName: "mic.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.white)
                    }
                }
                Spacer()
            }
            .padding(.bottom, 24)

            // Instruction text
            Text("Pick a topic related to \(chapter.title.lowercased()) and start recording:")
                .font(.comfortaa(14, weight: .regular))
                .foregroundColor(.mabelSubtle)
                .padding(.bottom, 16)

            // Suggestion cards
            VStack(spacing: 8) {
                ForEach(suggestionPrompts, id: \.self) { prompt in
                    NavigationLink(value: RecordingDestination(chapterIndex: chapterIndex, prompt: prompt)) {
                        SuggestionCardLabel(prompt: prompt)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.bottom, 24)

            // Write here toggle
            Button(action: { showWriteBox.toggle() }) {
                HStack {
                    Image(systemName: showWriteBox ? "chevron.down" : "chevron.right")
                        .font(.system(size: 12, weight: .semibold))
                    Text("Or write here...")
                        .font(.comfortaa(14, weight: .medium))
                }
                .foregroundColor(.mabelTeal)
            }
            .padding(.bottom, 8)

            if showWriteBox {
                TextEditor(text: $typedEntry)
                    .font(.comfortaa(14, weight: .regular))
                    .foregroundColor(.mabelText)
                    .scrollContentBackground(.hidden)
                    .padding(12)
                    .frame(minHeight: 120)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.mabelSurface.opacity(0.9))
                    )
                    .padding(.bottom, 12)

                if !typedEntry.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    CTAButton(title: "SAVE WRITTEN MEMORY") {
                        saveTypedMemory()
                    }
                    .padding(.bottom, 12)
                }
            }
        }
    }

    private func saveTypedMemory() {
        let trimmed = typedEntry.trimmingCharacters(in: .whitespacesAndNewlines)
        let memory = Memory(
            promptUsed: nil,
            state: .submitted,
            typedEntry: trimmed,
            createdAt: Date()
        )
        appState.addMemory(chapterIndex: chapterIndex, memory: memory)

        // Process typed entry through GPT
        let memoryID = memory.id
        Task {
            await StoryProcessingService.shared.processTypedMemory(
                memoryID: memoryID,
                chapterIndex: chapterIndex,
                text: trimmed,
                chapter: chapter,
                userName: appState.userProfile?.displayName ?? "Narrator",
                appState: appState
            )
        }

        typedEntry = ""
        showWriteBox = false
    }
}

// Navigation destination for recording
struct RecordingDestination: Hashable {
    let chapterIndex: Int
    let prompt: String?
}

#Preview {
    NavigationStack {
        RecordingSetupView(chapterIndex: 0)
            .environment(AppState())
    }
}
