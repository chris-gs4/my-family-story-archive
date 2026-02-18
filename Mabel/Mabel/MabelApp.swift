import SwiftUI

@main
struct MabelApp: App {
    init() {
        for family in UIFont.familyNames.sorted() {
            if family.lowercased().contains("comfortaa") {
                print("Found font family: \(family)")
                for name in UIFont.fontNames(forFamilyName: family) {
                    print("  - \(name)")
                }
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
