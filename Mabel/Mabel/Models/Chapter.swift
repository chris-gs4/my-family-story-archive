import Foundation

struct Chapter: Identifiable, Codable {
    let id: Int // 1-10
    let title: String
    let topic: String
    var memories: [Memory]
    var generatedNarrative: String?
    var isApproved: Bool = false

    var completedMemoryCount: Int {
        memories.filter { $0.state == .submitted || $0.state == .processing || $0.state == .processed }.count
    }

    var isCompleted: Bool {
        completedMemoryCount >= 5 && generatedNarrative != nil && isApproved
    }

    /// Chapter has a narrative ready for review (but not yet approved)
    var isReadyForReview: Bool {
        generatedNarrative != nil && !isApproved
    }

    var isAvailable: Bool {
        true // no paywall for MVP
    }

    // Custom decoder to handle existing data without isApproved field
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        topic = try container.decode(String.self, forKey: .topic)
        memories = try container.decode([Memory].self, forKey: .memories)
        generatedNarrative = try container.decodeIfPresent(String.self, forKey: .generatedNarrative)
        isApproved = try container.decodeIfPresent(Bool.self, forKey: .isApproved) ?? false
    }

    init(id: Int, title: String, topic: String, memories: [Memory], generatedNarrative: String? = nil, isApproved: Bool = false) {
        self.id = id
        self.title = title
        self.topic = topic
        self.memories = memories
        self.generatedNarrative = generatedNarrative
        self.isApproved = isApproved
    }

    static let allChapters: [Chapter] = [
        Chapter(id: 1, title: "Childhood", topic: "Early memories, family home, childhood adventures", memories: []),
        Chapter(id: 2, title: "Family", topic: "Parents, siblings, family traditions and dynamics", memories: []),
        Chapter(id: 3, title: "School Days", topic: "School experiences, teachers, friendships, lessons learned", memories: []),
        Chapter(id: 4, title: "Coming of Age", topic: "Teenage years, first experiences, growing independence", memories: []),
        Chapter(id: 5, title: "Love & Relationships", topic: "Romantic relationships, friendships, meaningful connections", memories: []),
        Chapter(id: 6, title: "Career & Purpose", topic: "Work life, career choices, professional milestones", memories: []),
        Chapter(id: 7, title: "Parenthood", topic: "Becoming a parent, raising children, family life", memories: []),
        Chapter(id: 8, title: "Adventures", topic: "Travel, adventures, memorable experiences and places", memories: []),
        Chapter(id: 9, title: "Challenges", topic: "Overcoming obstacles, difficult times, resilience", memories: []),
        Chapter(id: 10, title: "Reflections", topic: "Life lessons, wisdom, hopes for the future", memories: [])
    ]
}
