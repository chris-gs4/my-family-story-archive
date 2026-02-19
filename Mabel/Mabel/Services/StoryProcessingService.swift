import Foundation

@MainActor
class StoryProcessingService {
    static let shared = StoryProcessingService()

    private let openAI = OpenAIService.shared

    func processMemory(
        memoryID: UUID,
        chapterIndex: Int,
        audioURL: URL,
        chapter: Chapter,
        userName: String,
        appState: AppState
    ) async {
        // Mark as processing
        appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
            memory.state = .processing
        }

        do {
            // Step 1: Transcribe audio
            let transcript = try await openAI.transcribeAudio(fileURL: audioURL)

            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.transcript = transcript
            }

            // Step 2: Generate narrative from transcript
            let narrative = try await openAI.generateNarrative(
                transcript: transcript,
                chapterTitle: chapter.title,
                chapterTopic: chapter.topic,
                userName: userName
            )

            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.narrativeText = narrative
                memory.state = .processed
            }

            // Step 3: Check if all 5 memories are processed — if so, generate combined chapter narrative
            let updatedChapter = appState.chapters[chapterIndex]
            let processedMemories = updatedChapter.memories.filter { $0.state == .processed }

            if processedMemories.count >= 5 {
                let memoryNarratives = processedMemories.compactMap { $0.narrativeText }
                if memoryNarratives.count >= 5 {
                    let chapterNarrative = try await openAI.generateChapterNarrative(
                        memories: memoryNarratives,
                        chapterTitle: chapter.title,
                        chapterTopic: chapter.topic,
                        userName: userName
                    )
                    appState.updateNarrative(chapterIndex: chapterIndex, text: chapterNarrative)
                }
            }

            print("Successfully processed memory \(memoryID)")

        } catch {
            print("Failed to process memory \(memoryID): \(error.localizedDescription)")
            // Keep the memory as submitted so it can be retried
            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.state = .submitted
            }
        }
    }
}
