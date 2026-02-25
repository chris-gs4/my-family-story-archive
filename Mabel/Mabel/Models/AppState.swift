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

// MARK: - Debug Seed Data

#if DEBUG
extension AppState {
    func seedDummyData() {
        // Create profile
        var profile = UserProfile(displayName: "Margaret", writingGoal: "2x week", gender: "Female")
        profile.hasCompletedOnboarding = true
        self.userProfile = profile

        // Start with default chapters
        var seeded = Chapter.allChapters

        // Chapter 1 — Childhood: Completed (5 processed + narrative + approved)
        seeded[0].memories = [
            Memory(
                promptUsed: "What is your earliest memory?",
                transcript: "My earliest memory is sitting on the porch of our old farmhouse, watching fireflies light up the yard at dusk. I must have been about three years old.",
                narrativeText: "Margaret's earliest memory is a quiet evening on the porch of the family farmhouse. At barely three years old, she sat mesmerized as fireflies danced across the darkening yard, their tiny lights winking in and out like earthbound stars.",
                state: .processed,
                duration: 45,
                createdAt: Date().addingTimeInterval(-86400 * 30)
            ),
            Memory(
                promptUsed: "Describe the house you grew up in.",
                transcript: "We lived in a white clapboard house with green shutters. There was a big oak tree in the front yard that my father hung a tire swing from.",
                narrativeText: "The house on Maple Street was a white clapboard beauty with forest-green shutters. In the front yard stood a towering oak tree, its branches spread wide enough to shade the entire porch. From one sturdy limb hung a tire swing—her father's handiwork—that became the center of countless childhood afternoons.",
                state: .processed,
                duration: 62,
                createdAt: Date().addingTimeInterval(-86400 * 28)
            ),
            Memory(
                promptUsed: "What games did you play as a child?",
                transcript: "We played kick the can, hide and seek, and my favorite was making mud pies in the backyard. My sister and I had a whole pretend bakery going.",
                narrativeText: "Kick the can and hide-and-seek filled the long summer evenings, but Margaret's true passion was the backyard bakery she ran with her sister. Armed with old pie tins and an endless supply of mud, the two girls crafted elaborate confections, serving them to an audience of patient stuffed animals.",
                state: .processed,
                duration: 55,
                createdAt: Date().addingTimeInterval(-86400 * 25)
            ),
            Memory(
                promptUsed: "Who was your best friend growing up?",
                transcript: "Dorothy Miller lived two houses down. We were inseparable from age five until she moved away when we were twelve. We wrote letters for years after that.",
                narrativeText: "Dorothy Miller lived just two houses down, and from the moment they met at age five, the girls were inseparable. They shared secrets, scraped knees, and seven golden years of friendship before Dorothy's family moved away. The letters they exchanged for years afterward became some of Margaret's most treasured possessions.",
                state: .processed,
                duration: 48,
                createdAt: Date().addingTimeInterval(-86400 * 20)
            ),
            Memory(
                promptUsed: "What was your favorite thing to do after school?",
                transcript: "I'd race home to listen to radio programs with my grandmother. She always had cookies ready and we'd sit together in the parlor until dinner time.",
                narrativeText: "Every afternoon, Margaret raced home from school to the parlor where her grandmother waited with a plate of fresh cookies and the radio already warming up. Together they listened to their favorite programs, the old woman's soft commentary weaving between the stories, creating a daily ritual that Margaret would cherish long after those afternoons ended.",
                state: .processed,
                duration: 52,
                createdAt: Date().addingTimeInterval(-86400 * 18)
            ),
        ]
        seeded[0].generatedNarrative = """
        Chapter 1: Childhood

        Margaret's childhood unfolded in the gentle rhythm of small-town life. Her earliest memory—fireflies dancing across the farmhouse yard at dusk—set the tone for years filled with simple wonder and deep connection.

        The white clapboard house on Maple Street, with its green shutters and towering oak, was the backdrop for countless adventures. A tire swing hung from the oak's strongest limb, and the backyard became an imaginary bakery where Margaret and her sister served mud pies to stuffed animal customers.

        Friendship came easily in those days. Dorothy Miller, who lived two houses down, became Margaret's inseparable companion for seven golden years. And every afternoon, her grandmother waited in the parlor with cookies and the radio, creating a daily ritual that anchored Margaret's childhood in warmth and belonging.
        """
        seeded[0].isApproved = true

        // Chapter 2 — Family: In progress (2 processed + 1 failed)
        seeded[1].memories = [
            Memory(
                promptUsed: "Describe your mother in three words, then explain why.",
                transcript: "Strong, kind, and stubborn. She raised four children practically on her own while Dad worked the railroad. She never complained, but she had opinions about everything.",
                narrativeText: "Strong, kind, and stubborn—three words that barely begin to capture Margaret's mother. She raised four children nearly single-handedly while her husband worked the railroad, never once voicing a complaint. Yet she held firm opinions on everything from the proper way to hang laundry to the importance of Sunday dinners.",
                state: .processed,
                duration: 70,
                createdAt: Date().addingTimeInterval(-86400 * 10)
            ),
            Memory(
                promptUsed: "What is your favorite memory with your father?",
                transcript: "He took me fishing one Saturday morning, just the two of us. He wasn't much of a talker but that day he told me stories about his own childhood. It was the most I ever heard him speak at once.",
                narrativeText: "One Saturday morning, her father took just Margaret fishing—a rare moment alone with a man of few words. As they sat by the river, he began telling stories of his own childhood, more words than Margaret had ever heard him string together. That quiet morning by the water became one of her most treasured memories.",
                state: .processed,
                duration: 58,
                createdAt: Date().addingTimeInterval(-86400 * 8)
            ),
            Memory(
                promptUsed: "Tell me about your siblings and your relationship with them.",
                state: .failed,
                duration: 42,
                errorMessage: "Transcription failed: audio quality too low",
                createdAt: Date().addingTimeInterval(-86400 * 5)
            ),
        ]

        // Chapter 3 — School Days: Ready for review (5 processed + narrative, not approved)
        seeded[2].memories = [
            Memory(
                promptUsed: "Who was your favorite teacher and why?",
                transcript: "Mrs. Henderson taught English and she made us fall in love with books. She read aloud to us every Friday afternoon.",
                narrativeText: "Mrs. Henderson's Friday afternoon readings were the highlight of the school week. Her English class didn't just teach grammar and composition—it opened doorways into worlds that Margaret never knew existed.",
                state: .processed,
                duration: 40,
                createdAt: Date().addingTimeInterval(-86400 * 15)
            ),
            Memory(
                promptUsed: "What subject did you love most in school?",
                transcript: "History, without a doubt. I loved learning about how people lived in different times. It made me feel connected to something bigger than myself.",
                narrativeText: "History captured Margaret's imagination like no other subject. Learning how people lived in different eras gave her a sense of connection to something far larger than her small-town world.",
                state: .processed,
                duration: 38,
                createdAt: Date().addingTimeInterval(-86400 * 14)
            ),
            Memory(
                promptUsed: "Tell me about your best friend in school.",
                transcript: "That was still Dorothy, until she moved. After that, I became close with Sarah Park. She was quiet like me and we'd spend recess reading under the big elm tree.",
                narrativeText: "After Dorothy moved away, Margaret found a kindred spirit in Sarah Park. Both girls were quiet by nature, preferring the shade of the schoolyard elm and the company of books to the noisy games of their classmates.",
                state: .processed,
                duration: 44,
                createdAt: Date().addingTimeInterval(-86400 * 13)
            ),
            Memory(
                promptUsed: "Did you play any sports or join any clubs?",
                transcript: "I was in the school choir and the library club. I wasn't much for sports, but I loved singing and being surrounded by books.",
                narrativeText: "Athletics held little appeal for Margaret, but she found her place in the school choir and the library club. Singing gave her confidence, and the library—with its endless shelves of stories—felt like a second home.",
                state: .processed,
                duration: 35,
                createdAt: Date().addingTimeInterval(-86400 * 12)
            ),
            Memory(
                promptUsed: "What did you want to be when you grew up?",
                transcript: "A librarian. I thought it was the most wonderful job in the world—getting paid to be around books all day. I did eventually work at the town library for a few years.",
                narrativeText: "Margaret's dream job was wonderfully straightforward: she wanted to be a librarian. The idea of being paid to spend every day surrounded by books seemed almost too good to be true. Years later, she would make that dream a reality, working at the town library.",
                state: .processed,
                duration: 46,
                createdAt: Date().addingTimeInterval(-86400 * 11)
            ),
        ]
        seeded[2].generatedNarrative = """
        Chapter 3: School Days

        School was where Margaret's inner world began to bloom. Under the guidance of Mrs. Henderson, whose Friday afternoon readings were legendary, she discovered a lifelong love of literature. History class connected her to the sweep of human experience, making her small-town life feel part of something vast and meaningful.

        After Dorothy moved away, Margaret found a new companion in Sarah Park. The two bookish girls spent their recesses reading under the schoolyard elm, building a quiet friendship rooted in shared sensibilities. Margaret joined the choir and the library club, finding her voice in song and her sanctuary among the shelves.

        Her dream of becoming a librarian—born in those school-day hours—would eventually come true, proof that the seeds planted in childhood can bear the sweetest fruit.
        """
        seeded[2].isApproved = false

        // Chapter 4 — Coming of Age: One typed entry (submitted)
        seeded[3].memories = [
            Memory(
                promptUsed: "When did you first feel like an adult?",
                state: .submitted,
                duration: 0,
                typedEntry: "I think I first felt like an adult the summer I turned sixteen. My mother fell ill and I had to take over running the household for nearly two months. I cooked, cleaned, and looked after my younger siblings. When she recovered, she told me she was proud of how I'd handled everything. That meant the world to me.",
                createdAt: Date().addingTimeInterval(-86400 * 2)
            ),
        ]

        // Chapters 5–10 remain empty (already default)

        self.chapters = seeded
        saveProfile()
        saveChapters()
    }
}
#endif
