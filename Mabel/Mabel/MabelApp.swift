import SwiftUI

@main
struct MabelApp: App {
    @State private var appState = AppState()

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
