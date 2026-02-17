import XCTest
@testable import Mabel

final class MabelTests: XCTestCase {
    func testSetupDataValidation() {
        var data = SetupData()
        XCTAssertFalse(data.isComplete)

        data.name = "Mom"
        data.relationship = "A Parent"
        data.topics = ["Childhood"]
        XCTAssertTrue(data.isComplete)
    }

    func testSetupDataFreeJournaling() {
        var data = SetupData()
        data.name = "Dad"
        data.relationship = "A Parent"
        data.isFreeJournaling = true
        XCTAssertTrue(data.isComplete)
    }

    func testMockStoriesExist() {
        XCTAssertFalse(StoryEntry.mockEntries.isEmpty)
        XCTAssertEqual(StoryEntry.mockEntries.count, 2)
    }
}
