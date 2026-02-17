import SwiftUI

enum AppScreen: Hashable {
    case welcome
    case setup
    case recordPrompt
    case recording(prompt: String?)
    case savedStories
}

struct ContentView: View {
    @State private var path = NavigationPath()
    @State private var setupData = SetupData()
    @State private var stories: [StoryEntry] = StoryEntry.mockEntries

    var body: some View {
        NavigationStack(path: $path) {
            WelcomeView(onGetStarted: {
                path.append(AppScreen.setup)
            })
            .navigationDestination(for: AppScreen.self) { screen in
                switch screen {
                case .welcome:
                    WelcomeView(onGetStarted: {
                        path.append(AppScreen.setup)
                    })
                case .setup:
                    SetupView(setupData: $setupData, onStart: {
                        path.append(AppScreen.recordPrompt)
                    })
                case .recordPrompt:
                    RecordPromptView(
                        onStartRecording: { prompt in
                            path.append(AppScreen.recording(prompt: prompt))
                        }
                    )
                case .recording(let prompt):
                    RecordingView(
                        prompt: prompt,
                        onSave: {
                            // Navigate to saved stories, replacing the stack
                            path = NavigationPath()
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                                path.append(AppScreen.savedStories)
                            }
                        },
                        onClear: {
                            path.removeLast()
                        }
                    )
                case .savedStories:
                    SavedStoriesView(
                        stories: $stories,
                        onNewRecording: {
                            path.append(AppScreen.recordPrompt)
                        }
                    )
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
