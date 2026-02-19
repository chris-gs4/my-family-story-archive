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

                    // Chapter heading
                    Text("Chapter \(chapter.id) – \(chapter.title)")
                        .font(.comfortaa(22, weight: .bold))
                        .foregroundColor(.mabelText)
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

                    // Mic button — centered
                    HStack {
                        Spacer()
                        NavigationLink(value: RecordingDestination(chapterIndex: chapterIndex, prompt: nil)) {
                            ZStack {
                                // Outer pulse ring
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
                                SuggestionCard(prompt: prompt, action: {})
                                    .allowsHitTesting(false)
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

                    Spacer()
                        .frame(height: 40)
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationBarHidden(true)
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

    private func saveTypedMemory() {
        let memory = Memory(
            promptUsed: nil,
            state: .submitted,
            typedEntry: typedEntry.trimmingCharacters(in: .whitespacesAndNewlines),
            createdAt: Date()
        )
        appState.addMemory(chapterIndex: chapterIndex, memory: memory)
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
