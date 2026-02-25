import Foundation
import Observation
import SwiftUI

@Observable
class AppState {
    var userProfile: UserProfile?
    var chapters: [Chapter] = []
    var selectedTab: Int = 0
    var navigationPath = NavigationPath()

    var isOnboardingComplete: Bool {
        userProfile?.hasCompletedOnboarding ?? false
    }

    var completedChapterCount: Int {
        chapters.filter { $0.isCompleted }.count
    }

    /// The first chapter that isn't fully completed, or the last one
    var currentChapter: Chapter? {
        chapters.first(where: { !$0.isCompleted }) ?? chapters.last
    }

    // MARK: - Persistence Paths

    private static var documentsDirectory: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private static var profileURL: URL {
        documentsDirectory.appendingPathComponent("userProfile.json")
    }

    private static var chaptersURL: URL {
        documentsDirectory.appendingPathComponent("chapters.json")
    }

    // MARK: - Init

    init() {
        loadProfile()
        loadChapters()
    }

    // MARK: - Onboarding

    func completeOnboarding(displayName: String, writingGoal: String) {
        var profile = UserProfile(displayName: displayName, writingGoal: writingGoal)
        profile.hasCompletedOnboarding = true
        self.userProfile = profile
        self.chapters = Chapter.allChapters
        saveProfile()
        saveChapters()
    }

    // MARK: - Memory Management

    func saveMemory(chapterIndex: Int, memory: Memory) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        // Find first empty slot or append
        if let emptyIndex = chapters[chapterIndex].memories.firstIndex(where: { $0.state == .notStarted }) {
            chapters[chapterIndex].memories[emptyIndex] = memory
        } else if chapters[chapterIndex].memories.count < 5 {
            chapters[chapterIndex].memories.append(memory)
        }
        saveChapters()
    }

    func addMemory(chapterIndex: Int, memory: Memory) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        chapters[chapterIndex].memories.append(memory)
        saveChapters()
    }

    func updateMemory(chapterIndex: Int, memoryID: UUID, update: (inout Memory) -> Void) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        if let memoryIndex = chapters[chapterIndex].memories.firstIndex(where: { $0.id == memoryID }) {
            update(&chapters[chapterIndex].memories[memoryIndex])
            saveChapters()
        }
    }

    func deleteMemory(chapterIndex: Int, memoryID: UUID) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        guard let memoryIndex = chapters[chapterIndex].memories.firstIndex(where: { $0.id == memoryID }) else { return }

        let memory = chapters[chapterIndex].memories[memoryIndex]

        // Delete associated audio file if it exists
        if let audioFileName = memory.audioFileName {
            let audioURL = Self.documentsDirectory.appendingPathComponent(audioFileName)
            try? FileManager.default.removeItem(at: audioURL)
        }

        chapters[chapterIndex].memories.remove(at: memoryIndex)

        // If completed count drops below 5, clear stale narrative and approval
        if chapters[chapterIndex].completedMemoryCount < 5 {
            chapters[chapterIndex].generatedNarrative = nil
            chapters[chapterIndex].isApproved = false
        }

        saveChapters()
    }

    func retryMemory(chapterIndex: Int, memoryID: UUID) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        guard let memoryIndex = chapters[chapterIndex].memories.firstIndex(where: { $0.id == memoryID }) else { return }

        let memory = chapters[chapterIndex].memories[memoryIndex]

        // Reset state
        chapters[chapterIndex].memories[memoryIndex].state = .submitted
        chapters[chapterIndex].memories[memoryIndex].errorMessage = nil
        saveChapters()

        let chapter = chapters[chapterIndex]
        let userName = userProfile?.displayName ?? "Narrator"

        if let typedEntry = memory.typedEntry, memory.audioFileName == nil {
            // Re-process typed memory
            Task {
                await StoryProcessingService.shared.processTypedMemory(
                    memoryID: memoryID,
                    chapterIndex: chapterIndex,
                    text: typedEntry,
                    chapter: chapter,
                    userName: userName,
                    appState: self
                )
            }
        } else if let audioFileName = memory.audioFileName {
            // Re-process audio memory
            let audioURL = Self.documentsDirectory.appendingPathComponent(audioFileName)
            Task {
                await StoryProcessingService.shared.processMemory(
                    memoryID: memoryID,
                    chapterIndex: chapterIndex,
                    audioURL: audioURL,
                    chapter: chapter,
                    userName: userName,
                    appState: self
                )
            }
        }
    }

    func updateNarrative(chapterIndex: Int, text: String) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        chapters[chapterIndex].generatedNarrative = text
        chapters[chapterIndex].isApproved = false
        saveChapters()
    }

    func approveChapter(chapterIndex: Int) {
        guard chapterIndex >= 0, chapterIndex < chapters.count else { return }
        chapters[chapterIndex].isApproved = true
        saveChapters()
    }

    // MARK: - Profile Updates

    func updateProfile(displayName: String? = nil, gender: String? = nil, writingGoal: String? = nil) {
        if let name = displayName { userProfile?.displayName = name }
        if let g = gender { userProfile?.gender = g }
        if let goal = writingGoal { userProfile?.writingGoal = goal }
        saveProfile()
    }

    // MARK: - Persistence

    private func saveProfile() {
        guard let profile = userProfile else { return }
        do {
            let data = try JSONEncoder().encode(profile)
            try data.write(to: Self.profileURL)
        } catch {
            print("Failed to save profile: \(error)")
        }
    }

    private func loadProfile() {
        do {
            let data = try Data(contentsOf: Self.profileURL)
            userProfile = try JSONDecoder().decode(UserProfile.self, from: data)
        } catch {
            userProfile = nil
        }
    }

    private func saveChapters() {
        do {
            let data = try JSONEncoder().encode(chapters)
            try data.write(to: Self.chaptersURL)
        } catch {
            print("Failed to save chapters: \(error)")
        }
    }

    private func loadChapters() {
        do {
            let data = try Data(contentsOf: Self.chaptersURL)
            chapters = try JSONDecoder().decode([Chapter].self, from: data)
        } catch {
            chapters = []
        }
    }

    /// Process any typed entries that are stuck at .submitted (no audio, have typedEntry text)
    func processStuckTypedEntries() {
        for (chapterIndex, chapter) in chapters.enumerated() {
            let stuckMemories = chapter.memories.filter { $0.state == .submitted && $0.typedEntry != nil && $0.audioFileName == nil }
            for memory in stuckMemories {
                Task {
                    await StoryProcessingService.shared.processTypedMemory(
                        memoryID: memory.id,
                        chapterIndex: chapterIndex,
                        text: memory.typedEntry!,
                        chapter: chapter,
                        userName: userProfile?.displayName ?? "Narrator",
                        appState: self
                    )
                }
            }
        }
    }

    /// Reset all data (for debugging)
    func resetAll() {
        userProfile = nil
        chapters = []
        try? FileManager.default.removeItem(at: Self.profileURL)
        try? FileManager.default.removeItem(at: Self.chaptersURL)
    }
}
