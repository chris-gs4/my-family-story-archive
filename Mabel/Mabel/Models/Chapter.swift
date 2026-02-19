import Foundation

struct Chapter: Identifiable, Codable {
    let id: Int // 1-10
    let title: String
    let topic: String
    var memories: [Memory]
    var generatedNarrative: String?

    var completedMemoryCount: Int {
        memories.filter { $0.state == .submitted || $0.state == .processing || $0.state == .processed }.count
    }

    var isCompleted: Bool {
        completedMemoryCount >= 5 && generatedNarrative != nil
    }

    var isAvailable: Bool {
        true // no paywall for MVP
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
