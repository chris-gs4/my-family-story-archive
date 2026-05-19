import Foundation

@MainActor
class StoryProcessingService {
    static let shared = StoryProcessingService()

    private let openAI = OpenAIService.shared

    /// Minimum word count for a transcript/typed entry to be considered substantive enough
    /// to send to GPT-4o. Below this we mark `.failed` and skip the API call to prevent
    /// the model from fabricating a memory out of "test test" / mic-checks / silence.
    private static let minWordCount = 8
    private static let minCharCount = 40

    /// User-facing copy when a recording has no substantive content.
    private static let audioNoContentMessage = "We couldn't hear a memory in that recording. Try again with a bit more detail?"
    /// User-facing copy when a typed entry has no substantive content.
    private static let typedNoContentMessage = "That entry was too short to write up. Add a bit more detail and try again?"

    /// Returns true if the given text is too short to send to the narrative generator.
    private static func isTooShort(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let wordCount = trimmed.split(whereSeparator: { $0.isWhitespace }).count
        return wordCount < minWordCount || trimmed.count < minCharCount
    }

    /// Fires a non-blocking GPT-4o-mini call to derive a 3–5 word evocative title from a
    /// completed narrative, then persists it onto the memory. Failures are swallowed —
    /// `MemoryCard` falls back to the 60-char narrative derivation when `generatedTitle`
    /// stays nil. Cost is ~$0.0001/memory; called once per completed memory narrative.
    private func generateTitleInBackground(
        narrative: String,
        memoryID: UUID,
        chapterIndex: Int,
        appState: AppState
    ) {
        Task {
            do {
                let title = try await openAI.generateMemoryTitle(narrative: narrative)
                appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                    memory.generatedTitle = title
                }
                print("Generated title for memory \(memoryID): '\(title)'")
            } catch {
                print("Title generation failed for memory \(memoryID): \(error.localizedDescription) — falling back to narrative derivation")
            }
        }
    }

    /// One-shot backfill for memories recorded before Phase 1.6, when AI titles didn't
    /// exist. Walks every chapter, finds processed memories with a narrative but no
    /// `generatedTitle`, and queues background title generation for each. Safe to call
    /// repeatedly — already-titled memories are skipped. Sequential rather than
    /// concurrent so we don't hammer the OpenAI rate limit on app launch.
    func backfillMissingTitles(appState: AppState) {
        let candidates: [(chapterIndex: Int, memoryID: UUID, narrative: String)] = appState.chapters
            .enumerated()
            .flatMap { chapterIndex, chapter in
                chapter.memories.compactMap { memory -> (Int, UUID, String)? in
                    guard memory.state == .processed,
                          let narrative = memory.narrativeText, !narrative.isEmpty,
                          memory.generatedTitle == nil || memory.generatedTitle?.isEmpty == true
                    else { return nil }
                    return (chapterIndex, memory.id, narrative)
                }
            }

        guard !candidates.isEmpty else { return }
        print("Title backfill: queuing \(candidates.count) memor\(candidates.count == 1 ? "y" : "ies") without generatedTitle")

        Task {
            for candidate in candidates {
                do {
                    let title = try await openAI.generateMemoryTitle(narrative: candidate.narrative)
                    appState.updateMemory(chapterIndex: candidate.chapterIndex, memoryID: candidate.memoryID) { memory in
                        memory.generatedTitle = title
                    }
                    print("Backfilled title for memory \(candidate.memoryID): '\(title)'")
                } catch {
                    print("Backfill title failed for memory \(candidate.memoryID): \(error.localizedDescription)")
                }
            }
        }
    }

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

            // Step 1.5: Length-floor guard — skip narrative generation on transcripts too
            // short to be a real memory. Prevents GPT-4o from fabricating content on
            // mic-checks, silence, or noise. Belt-and-braces alongside the prompt-level
            // refusal clause in OpenAIService.generateNarrative.
            if Self.isTooShort(transcript) {
                print("Skipped narrative for memory \(memoryID): transcript too short — '\(transcript.prefix(60))'")
                appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                    memory.state = .failed
                    memory.errorMessage = Self.audioNoContentMessage
                }
                return
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

            // Kick off the 3–5 word title in the background. Runs in parallel with the
            // chapter-narrative generation below; the memory card updates whenever the
            // title resolves. Failures fall back silently to derivation.
            generateTitleInBackground(
                narrative: narrative,
                memoryID: memoryID,
                chapterIndex: chapterIndex,
                appState: appState
            )

            // Step 3: regenerate the chapter narrative once the chapter has reached the
            // 5-memory threshold OR whenever a bonus memory is added to a chapter that
            // already has a narrative. `updateNarrative()` revokes `isApproved`, so adding
            // a bonus to an approved chapter sends it back to the review flow with the new
            // memory woven in. This is the e-book/audiobook integrity rule: the published
            // narrative always includes every recorded memory.
            let updatedChapter = appState.chapters[chapterIndex]
            let processedMemories = updatedChapter.memories.filter { $0.state == .processed }

            if processedMemories.count >= Chapter.memoriesPerChapter {
                let memoryNarratives = processedMemories.compactMap { $0.narrativeText }
                if memoryNarratives.count >= Chapter.memoriesPerChapter {
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

        } catch OpenAIError.noSubstantiveContent {
            print("Model returned no-content sentinel for memory \(memoryID)")
            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.state = .failed
                memory.errorMessage = Self.audioNoContentMessage
            }
        } catch {
            print("Failed to process memory \(memoryID): \(error.localizedDescription)")
            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.state = .failed
                memory.errorMessage = error.localizedDescription
            }
        }
    }

    /// Process a typed memory (no audio — skip Whisper, send text directly to GPT)
    func processTypedMemory(
        memoryID: UUID,
        chapterIndex: Int,
        text: String,
        chapter: Chapter,
        userName: String,
        appState: AppState
    ) async {
        appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
            memory.state = .processing
        }

        // Length-floor guard before the API call. Same rationale as the audio path —
        // prevents GPT-4o from fabricating a memory out of a one-word "test" entry.
        if Self.isTooShort(text) {
            print("Skipped narrative for typed memory \(memoryID): entry too short — '\(text.prefix(60))'")
            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.state = .failed
                memory.errorMessage = Self.typedNoContentMessage
            }
            return
        }

        do {
            let narrative = try await openAI.generateNarrative(
                transcript: text,
                chapterTitle: chapter.title,
                chapterTopic: chapter.topic,
                userName: userName
            )

            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.narrativeText = narrative
                memory.state = .processed
            }

            generateTitleInBackground(
                narrative: narrative,
                memoryID: memoryID,
                chapterIndex: chapterIndex,
                appState: appState
            )

            // Check for chapter completion. Mirrors processMemory above — bonus memories
            // regenerate the chapter narrative so the published story always includes every
            // recorded memory; approval is revoked via `updateNarrative` and the user
            // re-reviews.
            let updatedChapter = appState.chapters[chapterIndex]
            let processedMemories = updatedChapter.memories.filter { $0.state == .processed }

            if processedMemories.count >= Chapter.memoriesPerChapter {
                let memoryNarratives = processedMemories.compactMap { $0.narrativeText }
                if memoryNarratives.count >= Chapter.memoriesPerChapter {
                    let chapterNarrative = try await openAI.generateChapterNarrative(
                        memories: memoryNarratives,
                        chapterTitle: chapter.title,
                        chapterTopic: chapter.topic,
                        userName: userName
                    )
                    appState.updateNarrative(chapterIndex: chapterIndex, text: chapterNarrative)
                }
            }

            print("Successfully processed typed memory \(memoryID)")

        } catch OpenAIError.noSubstantiveContent {
            print("Model returned no-content sentinel for typed memory \(memoryID)")
            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.state = .failed
                memory.errorMessage = Self.typedNoContentMessage
            }
        } catch {
            print("Failed to process typed memory \(memoryID): \(error.localizedDescription)")
            appState.updateMemory(chapterIndex: chapterIndex, memoryID: memoryID) { memory in
                memory.state = .failed
                memory.errorMessage = error.localizedDescription
            }
        }
    }
}
