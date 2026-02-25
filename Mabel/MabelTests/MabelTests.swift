import XCTest
@testable import Mabel

@MainActor
final class MabelTests: XCTestCase {

    // MARK: - Helpers

    private func makeMemory(
        state: MemoryState = .processed,
        transcript: String? = "Some transcript",
        narrativeText: String? = "Some narrative",
        typedEntry: String? = nil,
        errorMessage: String? = nil,
        duration: TimeInterval = 60
    ) -> Memory {
        Memory(
            promptUsed: "Test prompt",
            transcript: transcript,
            narrativeText: narrativeText,
            state: state,
            duration: duration,
            typedEntry: typedEntry,
            errorMessage: errorMessage,
            createdAt: Date()
        )
    }

    private func makeChapter(
        id: Int = 1,
        memories: [Memory] = [],
        narrative: String? = nil,
        approved: Bool = false
    ) -> Chapter {
        Chapter(
            id: id,
            title: "Test Chapter",
            topic: "Test topic",
            memories: memories,
            generatedNarrative: narrative,
            isApproved: approved
        )
    }

    private func makeAppState(chapters: [Chapter] = []) -> AppState {
        let state = AppState()
        state.chapters = chapters
        return state
    }

    // MARK: - Chapter Computed Properties

    func testCompletedMemoryCountIgnoresNotStartedAndFailed() {
        let memories = [
            makeMemory(state: .submitted),
            makeMemory(state: .processing),
            makeMemory(state: .processed),
            makeMemory(state: .notStarted),
            makeMemory(state: .failed),
        ]
        let chapter = makeChapter(memories: memories)
        XCTAssertEqual(chapter.completedMemoryCount, 3)
    }

    func testCompletedMemoryCountEmptyChapter() {
        let chapter = makeChapter()
        XCTAssertEqual(chapter.completedMemoryCount, 0)
    }

    func testIsCompletedRequiresAllThree() {
        let memories = (0..<5).map { _ in makeMemory(state: .processed) }
        let chapter = makeChapter(memories: memories, narrative: "A narrative", approved: true)
        XCTAssertTrue(chapter.isCompleted)
    }

    func testIsCompletedFalseWhenNarrativeMissing() {
        let memories = (0..<5).map { _ in makeMemory(state: .processed) }
        let chapter = makeChapter(memories: memories, narrative: nil, approved: true)
        XCTAssertFalse(chapter.isCompleted)
    }

    func testIsReadyForReviewWhenNarrativeExistsButNotApproved() {
        let chapter = makeChapter(narrative: "A narrative", approved: false)
        XCTAssertTrue(chapter.isReadyForReview)
    }

    // MARK: - deleteMemory

    func testDeleteMemoryRemovesTargeted() {
        let memory = makeMemory(state: .processed)
        let chapter = makeChapter(memories: [memory])
        let appState = makeAppState(chapters: [chapter])

        XCTAssertEqual(appState.chapters[0].memories.count, 1)
        appState.deleteMemory(chapterIndex: 0, memoryID: memory.id)
        XCTAssertEqual(appState.chapters[0].memories.count, 0)
    }

    func testDeleteMemoryClearsNarrativeWhenCountDropsBelow5() {
        var memories = (0..<5).map { _ in makeMemory(state: .processed) }
        let toDelete = memories[0]
        let chapter = makeChapter(memories: memories, narrative: "Existing narrative", approved: true)
        let appState = makeAppState(chapters: [chapter])

        appState.deleteMemory(chapterIndex: 0, memoryID: toDelete.id)
        XCTAssertNil(appState.chapters[0].generatedNarrative)
        XCTAssertFalse(appState.chapters[0].isApproved)
    }

    func testDeleteMemoryPreservesNarrativeWhenCountStaysAtOrAbove5() {
        let memories = (0..<6).map { _ in makeMemory(state: .processed) }
        let toDelete = memories[0]
        let chapter = makeChapter(memories: memories, narrative: "Existing narrative", approved: true)
        let appState = makeAppState(chapters: [chapter])

        appState.deleteMemory(chapterIndex: 0, memoryID: toDelete.id)
        XCTAssertEqual(appState.chapters[0].memories.count, 5)
        XCTAssertNotNil(appState.chapters[0].generatedNarrative)
    }

    func testDeleteMemoryInvalidChapterIndexNoCrash() {
        let appState = makeAppState(chapters: [makeChapter()])
        appState.deleteMemory(chapterIndex: 99, memoryID: UUID())
        // No crash = pass
    }

    // MARK: - retryMemory

    func testRetryMemoryResetsStateAndClearsError() {
        let memory = makeMemory(state: .failed, errorMessage: "Network error")
        let chapter = makeChapter(memories: [memory])
        let appState = makeAppState(chapters: [chapter])

        appState.retryMemory(chapterIndex: 0, memoryID: memory.id)

        XCTAssertEqual(appState.chapters[0].memories[0].state, .submitted)
        XCTAssertNil(appState.chapters[0].memories[0].errorMessage)
    }

    func testRetryMemoryNonexistentIDNoCrash() {
        let chapter = makeChapter(memories: [makeMemory(state: .failed)])
        let appState = makeAppState(chapters: [chapter])

        appState.retryMemory(chapterIndex: 0, memoryID: UUID())
        // No crash = pass
    }

    func testRetryMemoryPreservesOtherFields() {
        let memory = makeMemory(
            state: .failed,
            transcript: "My transcript",
            narrativeText: "My narrative",
            typedEntry: "Typed text",
            errorMessage: "Error"
        )
        let chapter = makeChapter(memories: [memory])
        let appState = makeAppState(chapters: [chapter])

        appState.retryMemory(chapterIndex: 0, memoryID: memory.id)

        let retried = appState.chapters[0].memories[0]
        XCTAssertEqual(retried.state, .submitted)
        XCTAssertNil(retried.errorMessage)
        XCTAssertEqual(retried.transcript, "My transcript")
        XCTAssertEqual(retried.narrativeText, "My narrative")
        XCTAssertEqual(retried.typedEntry, "Typed text")
    }

    // MARK: - saveMemory

    func testSaveMemoryFillsFirstNotStartedSlot() {
        let empty = makeMemory(state: .notStarted)
        let chapter = makeChapter(memories: [empty])
        let appState = makeAppState(chapters: [chapter])

        let newMemory = makeMemory(state: .submitted)
        appState.saveMemory(chapterIndex: 0, memory: newMemory)

        XCTAssertEqual(appState.chapters[0].memories.count, 1)
        XCTAssertEqual(appState.chapters[0].memories[0].state, .submitted)
        XCTAssertEqual(appState.chapters[0].memories[0].id, newMemory.id)
    }

    func testSaveMemoryAppendsWhenNoEmptySlotsAndUnder5() {
        let existing = makeMemory(state: .processed)
        let chapter = makeChapter(memories: [existing])
        let appState = makeAppState(chapters: [chapter])

        let newMemory = makeMemory(state: .submitted)
        appState.saveMemory(chapterIndex: 0, memory: newMemory)

        XCTAssertEqual(appState.chapters[0].memories.count, 2)
    }

    func testSaveMemoryDoesNothingAt5WithNoEmptySlots() {
        let memories = (0..<5).map { _ in makeMemory(state: .processed) }
        let chapter = makeChapter(memories: memories)
        let appState = makeAppState(chapters: [chapter])

        let newMemory = makeMemory(state: .submitted)
        appState.saveMemory(chapterIndex: 0, memory: newMemory)

        XCTAssertEqual(appState.chapters[0].memories.count, 5)
    }

    // MARK: - addMemory

    func testAddMemoryAppendsToChapter() {
        let chapter = makeChapter(memories: [])
        let appState = makeAppState(chapters: [chapter])

        let memory = makeMemory(state: .submitted)
        appState.addMemory(chapterIndex: 0, memory: memory)

        XCTAssertEqual(appState.chapters[0].memories.count, 1)
        XCTAssertEqual(appState.chapters[0].memories[0].id, memory.id)
    }

    func testAddMemoryInvalidIndexNoCrash() {
        let appState = makeAppState(chapters: [])
        appState.addMemory(chapterIndex: 5, memory: makeMemory())
        // No crash = pass
    }

    // MARK: - updateNarrative + approveChapter

    func testUpdateNarrativeSetsTextAndClearsApproval() {
        let chapter = makeChapter(narrative: nil, approved: true)
        let appState = makeAppState(chapters: [chapter])

        appState.updateNarrative(chapterIndex: 0, text: "New narrative")

        XCTAssertEqual(appState.chapters[0].generatedNarrative, "New narrative")
        XCTAssertFalse(appState.chapters[0].isApproved)
    }

    func testApproveChapterSetsApprovedTrue() {
        let chapter = makeChapter(narrative: "A narrative", approved: false)
        let appState = makeAppState(chapters: [chapter])

        appState.approveChapter(chapterIndex: 0)

        XCTAssertTrue(appState.chapters[0].isApproved)
    }

    func testUpdateNarrativeOverwritesPrevious() {
        let chapter = makeChapter(narrative: "Old narrative", approved: true)
        let appState = makeAppState(chapters: [chapter])

        appState.updateNarrative(chapterIndex: 0, text: "New narrative")

        XCTAssertEqual(appState.chapters[0].generatedNarrative, "New narrative")
        XCTAssertFalse(appState.chapters[0].isApproved)
    }

    func testUpdateMemoryModifiesInPlace() {
        let memory = makeMemory(state: .processing)
        let chapter = makeChapter(memories: [memory])
        let appState = makeAppState(chapters: [chapter])

        appState.updateMemory(chapterIndex: 0, memoryID: memory.id) { m in
            m.state = .processed
            m.transcript = "Updated transcript"
        }

        XCTAssertEqual(appState.chapters[0].memories[0].state, .processed)
        XCTAssertEqual(appState.chapters[0].memories[0].transcript, "Updated transcript")
    }
}
