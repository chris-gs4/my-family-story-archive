import SwiftUI

@main
struct MabelApp: App {
    @State private var appState = AppState()

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
                .environment(appState)
                .task {
                    appState.processStuckTypedEntries()
                }
        }
    }
}
