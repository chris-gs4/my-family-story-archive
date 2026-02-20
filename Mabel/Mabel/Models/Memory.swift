import Foundation

enum MemoryState: String, Codable {
    case notStarted
    case submitted
    case processing
    case processed
    case failed
}

struct Memory: Identifiable, Codable {
    let id: UUID
    var promptUsed: String?
    var audioFileName: String?
    var transcript: String?
    var narrativeText: String?
    var state: MemoryState
    var duration: TimeInterval
    var typedEntry: String?
    var errorMessage: String?
    var createdAt: Date?

    init(
        id: UUID = UUID(),
        promptUsed: String? = nil,
        audioFileName: String? = nil,
        transcript: String? = nil,
        narrativeText: String? = nil,
        state: MemoryState = .notStarted,
        duration: TimeInterval = 0,
        typedEntry: String? = nil,
        errorMessage: String? = nil,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.promptUsed = promptUsed
        self.audioFileName = audioFileName
        self.transcript = transcript
        self.narrativeText = narrativeText
        self.state = state
        self.duration = duration
        self.typedEntry = typedEntry
        self.errorMessage = errorMessage
        self.createdAt = createdAt
    }
}
