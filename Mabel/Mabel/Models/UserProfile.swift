import Foundation

struct UserProfile: Codable {
    var displayName: String
    var writingGoal: String // "1x week", "2x week", "3x week", "I'll write when I want"
    var topicsOfInterest: [String]
    var relationship: String? // "Myself", "A Parent", "A Grandparent", "A Friend", "Other"
    var gender: String?
    var hasCompletedOnboarding: Bool
    var createdAt: Date

    init(displayName: String = "", writingGoal: String = "1x week", topicsOfInterest: [String] = [], relationship: String? = nil, gender: String? = nil) {
        self.displayName = displayName
        self.writingGoal = writingGoal
        self.topicsOfInterest = topicsOfInterest
        self.relationship = relationship
        self.gender = gender
        self.hasCompletedOnboarding = false
        self.createdAt = Date()
    }
}
