import Foundation

struct StoryEntry: Identifiable {
    let id: UUID
    var title: String
    var date: Date
    var previewText: String
    var fullText: String
    var duration: TimeInterval
    var characters: String
    var sceneDetails: String

    static let mockEntries: [StoryEntry] = [
        StoryEntry(
            id: UUID(),
            title: "Mom's Kitchen",
            date: Date(),
            previewText: "The smell of fresh bread would fill the entire house every Sunday morning. Mom would wake up before anyone else, her hands already dusted with flour by the time we stumbled downstairs. She had this old wooden rolling pin that belonged to her grandmother — the handles were worn smooth from decades of use.",
            fullText: "The smell of fresh bread would fill the entire house every Sunday morning. Mom would wake up before anyone else, her hands already dusted with flour by the time we stumbled downstairs. She had this old wooden rolling pin that belonged to her grandmother — the handles were worn smooth from decades of use. I remember sitting on the kitchen counter, legs dangling, watching her knead the dough with a rhythm that seemed almost musical. She'd hum old songs, the ones her mother used to sing, and the kitchen would feel like the warmest, safest place in the world.",
            duration: 185,
            characters: "",
            sceneDetails: ""
        ),
        StoryEntry(
            id: UUID(),
            title: "Summer at the Lake House",
            date: Calendar.current.date(byAdding: .day, value: -3, to: Date()) ?? Date(),
            previewText: "Every July, the whole family would pack into Dad's station wagon and drive four hours north to the lake house. The backseat was a tangle of fishing rods, beach towels, and board games. We'd argue about who got the window seat until Dad threatened to turn the car around.",
            fullText: "Every July, the whole family would pack into Dad's station wagon and drive four hours north to the lake house. The backseat was a tangle of fishing rods, beach towels, and board games. We'd argue about who got the window seat until Dad threatened to turn the car around. The lake house was small — just three bedrooms and a screened-in porch — but it felt enormous to us kids. We'd spend entire days swimming, catching frogs, and building forts in the woods behind the property.",
            duration: 220,
            characters: "",
            sceneDetails: ""
        )
    ]
}
