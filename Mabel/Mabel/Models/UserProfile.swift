import Foundation

struct UserProfile: Codable {
    var displayName: String
    var writingGoal: String // "1x week", "2x week", "3x week", "I'll write when I want"
    var gender: String?
    var hasCompletedOnboarding: Bool
    var createdAt: Date

    init(displayName: String = "", writingGoal: String = "1x week", gender: String? = nil) {
        self.displayName = displayName
        self.writingGoal = writingGoal
        self.gender = gender
        self.hasCompletedOnboarding = false
        self.createdAt = Date()
    }
}
