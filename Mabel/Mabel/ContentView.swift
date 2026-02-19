import SwiftUI

struct ContentView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        if !appState.isOnboardingComplete {
            OnboardingFlow()
        } else {
            MainTabView()
        }
    }
}

// MARK: - Onboarding Flow

struct OnboardingFlow: View {
    @Environment(AppState.self) private var appState
    @State private var showSetup = false

    var body: some View {
        NavigationStack {
            WelcomeView(onGetStarted: {
                showSetup = true
            })
            .navigationDestination(isPresented: $showSetup) {
                SetupView()
            }
        }
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                LibraryView()
            }
            .tabItem {
                Image(systemName: "book.fill")
                Text("Home")
            }
            .tag(0)

            NavigationStack {
                MyStoriesView()
            }
            .tabItem {
                Image(systemName: "text.book.closed.fill")
                Text("My Stories")
            }
            .tag(1)
        }
        .tint(.mabelTeal)
    }
}

#Preview {
    ContentView()
        .environment(AppState())
}
