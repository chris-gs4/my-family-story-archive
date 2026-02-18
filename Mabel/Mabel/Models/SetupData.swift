import Foundation

struct SetupData {
    var name: String = ""
    var relationship: String? = nil
    var topics: Set<String> = []
    var isFreeJournaling: Bool = false

    static let relationships = ["Myself", "A Parent", "A Grandparent", "A Friend", "Other"]

    static let topics = [
        "Childhood",
        "Immigration",
        "Career",
        "Family",
        "War / Service",
        "Education",
        "Faith",
        "Love / Relationships",
        "Health / Overcoming Adversity"
    ]

    var isComplete: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty
            && relationship != nil
            && (isFreeJournaling || !topics.isEmpty)
    }
}
