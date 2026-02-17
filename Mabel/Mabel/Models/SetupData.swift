import Foundation

struct SetupData {
    var name: String = ""
    var relationship: String? = nil
    var topics: Set<String> = []
    var isFreeJournaling: Bool = false

    static let relationships = ["Myself", "A Parent", "A Grandparent", "A Friend", "Other"]

    static let topics = [
        "Childhood",
        "Family traditions",
        "Career & work",
        "Love & relationships",
        "Travel & adventure",
        "Health & adversity",
        "Life lessons",
        "Milestones"
    ]

    var isComplete: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty
            && relationship != nil
            && (isFreeJournaling || !topics.isEmpty)
    }
}
