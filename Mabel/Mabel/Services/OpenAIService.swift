import Foundation

class OpenAIService {
    static let shared = OpenAIService()

    /// Sentinel string the narrative prompts must return when the source transcript/memories
    /// contain no substantive content. Used to prevent fabrication on garbage input.
    static let noContentSentinel = "__NO_CONTENT__"

    /// Known Whisper transcription artifacts. On silence, music, or non-speech audio,
    /// Whisper confidently emits one of these phrases — its training data contained heavy
    /// YouTube intro/outro content, so an empty clip often comes back as "Thank you for
    /// watching." or similar. Treat any transcript that exactly matches one of these
    /// (after normalization) as no-content so the length-floor downstream marks it failed.
    private static let knownWhisperHallucinations: Set<String> = [
        "thank you for watching",
        "thank you for watching the video",
        "thanks for watching",
        "thanks for watching the video",
        "thank you",
        "thank you so much",
        "thanks",
        "please subscribe",
        "please subscribe to the channel",
        "like and subscribe",
        "don't forget to like and subscribe",
        "see you next time",
        "see you in the next video",
        "bye",
        "bye bye",
        "bye-bye",
        "goodbye",
        "subtitles by the amara.org community",
        "subtitles by",
        "music",
        "[music]",
        "you"
    ]

    /// Returns the empty string if `text` is dominated by a known Whisper hallucination
    /// phrase, otherwise returns `text` unchanged. Empty output then trips the length-floor
    /// in `StoryProcessingService` and the memory lands in `.failed` with friendly copy.
    static func filterWhisperHallucination(_ text: String) -> String {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let normalized = trimmed
            .lowercased()
            .trimmingCharacters(in: CharacterSet.punctuationCharacters.union(.whitespacesAndNewlines))
        if normalized.isEmpty { return "" }
        if knownWhisperHallucinations.contains(normalized) {
            print("[Whisper] Filtered known hallucination: '\(trimmed.prefix(80))'")
            return ""
        }
        return text
    }

    private var apiKey: String {
        // Try to load from Config.plist first, then fall back to environment
        if let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
           let config = NSDictionary(contentsOfFile: path),
           let key = config["OPENAI_API_KEY"] as? String,
           !key.isEmpty {
            return key
        }
        return ProcessInfo.processInfo.environment["OPENAI_API_KEY"] ?? ""
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await URLSession.shared.data(for: request)
        } catch let error as URLError where error.code == .timedOut {
            throw OpenAIError.timeout
        }
    }

    // MARK: - Transcription (Whisper)

    func transcribeAudio(fileURL: URL) async throws -> String {
        guard !apiKey.isEmpty else {
            throw OpenAIError.missingAPIKey
        }

        let url = URL(string: "https://api.openai.com/v1/audio/transcriptions")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add model field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"model\"\r\n\r\n".data(using: .utf8)!)
        body.append("whisper-1\r\n".data(using: .utf8)!)

        // Pin language to English so Whisper doesn't misdetect script on short/ambiguous
        // clips (real-device test showed "test test test" coming back as Korean hangul).
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"language\"\r\n\r\n".data(using: .utf8)!)
        body.append("en\r\n".data(using: .utf8)!)

        // Add audio file
        let audioData = try Data(contentsOf: fileURL)
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileURL.lastPathComponent)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
        body.append(audioData)
        body.append("\r\n".data(using: .utf8)!)

        // Close boundary
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw OpenAIError.apiError(statusCode: httpResponse.statusCode, message: errorBody)
        }

        struct WhisperResponse: Codable {
            let text: String
        }

        let whisperResponse = try JSONDecoder().decode(WhisperResponse.self, from: data)
        return Self.filterWhisperHallucination(whisperResponse.text)
    }

    // MARK: - Narrative Generation (GPT)

    func generateNarrative(
        transcript: String,
        chapterTitle: String,
        chapterTopic: String,
        userName: String
    ) async throws -> String {
        guard !apiKey.isEmpty else {
            throw OpenAIError.missingAPIKey
        }

        let systemPrompt = """
        You are a ghostwriter helping someone write their memoir. Transform this voice recording transcript into a polished, first-person narrative paragraph suitable for a chapter about "\(chapterTopic)".

        The narrator's name is \(userName). Write in their voice — warm, personal, and vivid. Keep the original meaning and details but smooth out the language, remove filler words, and make it read like a published memoir.

        Important: do not invent details, names, places, events, or relationships that are not present in the transcript. If the transcript is too short, off-topic, unintelligible, or contains no substantive memory content (e.g. a test recording, mic-check, silence, or background noise), respond with exactly `\(OpenAIService.noContentSentinel)` and nothing else. Do not attempt to write a memoir paragraph from non-substantive input.
        """

        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let requestBody: [String: Any] = [
            "model": "gpt-4o",
            "messages": [
                ["role": "system", "content": systemPrompt],
                ["role": "user", "content": "Transcript:\n\(transcript)"]
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw OpenAIError.apiError(statusCode: httpResponse.statusCode, message: errorBody)
        }

        struct ChatResponse: Codable {
            struct Choice: Codable {
                struct Message: Codable {
                    let content: String
                }
                let message: Message
            }
            let choices: [Choice]
        }

        let chatResponse = try JSONDecoder().decode(ChatResponse.self, from: data)
        guard let content = chatResponse.choices.first?.message.content else {
            throw OpenAIError.noContent
        }

        if content.trimmingCharacters(in: .whitespacesAndNewlines) == OpenAIService.noContentSentinel {
            throw OpenAIError.noSubstantiveContent
        }

        return content
    }

    // MARK: - Combined Chapter Narrative

    func generateChapterNarrative(
        memories: [String],
        chapterTitle: String,
        chapterTopic: String,
        userName: String
    ) async throws -> String {
        guard !apiKey.isEmpty else {
            throw OpenAIError.missingAPIKey
        }

        let combinedMemories = memories.enumerated().map { index, text in
            "Memory \(index + 1):\n\(text)"
        }.joined(separator: "\n\n")

        let systemPrompt = """
        You are a ghostwriter helping someone write their memoir. You have 5 individual memory narratives from a chapter about "\(chapterTopic)". Combine them into a cohesive, flowing chapter narrative.

        The narrator's name is \(userName). Write in first person, warm and personal. Create smooth transitions between memories. The chapter should read like a polished memoir chapter — engaging, vivid, and emotionally resonant. Keep all the original details and meaning.

        Important: do not invent details, names, places, events, or relationships that are not present in the source memories. If the source memories are empty, unintelligible, or contain no substantive content to combine, respond with exactly `\(OpenAIService.noContentSentinel)` and nothing else. Do not fabricate a chapter from non-substantive input.
        """

        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let requestBody: [String: Any] = [
            "model": "gpt-4o",
            "messages": [
                ["role": "system", "content": systemPrompt],
                ["role": "user", "content": combinedMemories]
            ],
            "temperature": 0.7,
            "max_tokens": 3000
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw OpenAIError.apiError(statusCode: httpResponse.statusCode, message: errorBody)
        }

        struct ChatResponse: Codable {
            struct Choice: Codable {
                struct Message: Codable {
                    let content: String
                }
                let message: Message
            }
            let choices: [Choice]
        }

        let chatResponse = try JSONDecoder().decode(ChatResponse.self, from: data)
        guard let content = chatResponse.choices.first?.message.content else {
            throw OpenAIError.noContent
        }

        if content.trimmingCharacters(in: .whitespacesAndNewlines) == OpenAIService.noContentSentinel {
            throw OpenAIError.noSubstantiveContent
        }

        return content
    }
    // MARK: - AI-Generated Prompts

    func generatePrompts(
        chapterTitle: String,
        chapterTopic: String,
        userName: String,
        previousMemories: [String],
        count: Int = 3
    ) async throws -> [String] {
        guard !apiKey.isEmpty else {
            throw OpenAIError.missingAPIKey
        }

        var contextBlock = ""
        if !previousMemories.isEmpty {
            let summaries = previousMemories.enumerated().map { i, text in
                "Memory \(i + 1): \(String(text.prefix(200)))"
            }.joined(separator: "\n")
            contextBlock = """

            The narrator has already shared these memories across their book so far:
            \(summaries)

            Reference specific details from these memories to create personalized, follow-up style questions. For example, if they mentioned a city, ask about a specific place there. If they mentioned a person, ask about a specific moment with them.
            """
        }

        let systemPrompt = """
        You are Mabel, a warm and caring AI interviewer helping someone write their memoir. Generate exactly \(count) thoughtful interview prompts for a chapter about "\(chapterTopic)".

        The narrator's name is \(userName).
        \(contextBlock)

        Rules:
        - Each prompt should be a single question, warm and conversational
        - Questions should be specific and evocative, not generic
        - If you have context from previous memories, reference specific details naturally
        - Keep each prompt under 120 characters
        - Return ONLY the questions, one per line, no numbering or bullets
        """

        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let requestBody: [String: Any] = [
            "model": "gpt-4o-mini",
            "messages": [
                ["role": "system", "content": systemPrompt],
                ["role": "user", "content": "Generate \(count) interview prompts for the chapter \"\(chapterTitle)\"."]
            ],
            "temperature": 0.9,
            "max_tokens": 300
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw OpenAIError.apiError(statusCode: httpResponse.statusCode, message: errorBody)
        }

        struct ChatResponse: Codable {
            struct Choice: Codable {
                struct Message: Codable {
                    let content: String
                }
                let message: Message
            }
            let choices: [Choice]
        }

        let chatResponse = try JSONDecoder().decode(ChatResponse.self, from: data)
        guard let content = chatResponse.choices.first?.message.content else {
            throw OpenAIError.noContent
        }

        let prompts = content
            .components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
            .prefix(count)

        return Array(prompts)
    }

    // MARK: - Regenerate Chapter with Feedback

    func regenerateChapterNarrative(
        currentNarrative: String,
        feedback: String,
        memories: [String],
        chapterTitle: String,
        chapterTopic: String,
        userName: String
    ) async throws -> String {
        guard !apiKey.isEmpty else {
            throw OpenAIError.missingAPIKey
        }

        let combinedMemories = memories.enumerated().map { index, text in
            "Memory \(index + 1):\n\(text)"
        }.joined(separator: "\n\n")

        let systemPrompt = """
        You are a ghostwriter helping someone write their memoir. You previously wrote a chapter about "\(chapterTopic)" for \(userName). The user has reviewed it and wants changes.

        Their feedback: "\(feedback)"

        Rewrite the chapter incorporating this feedback. Keep writing in first person, warm and personal. Maintain all the original details and meaning from the source memories, but adjust the style, tone, or content based on the feedback.
        """

        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let requestBody: [String: Any] = [
            "model": "gpt-4o",
            "messages": [
                ["role": "system", "content": systemPrompt],
                ["role": "user", "content": "Source memories:\n\n\(combinedMemories)\n\nPrevious chapter draft:\n\n\(currentNarrative)"]
            ],
            "temperature": 0.7,
            "max_tokens": 3000
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await performRequest(request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw OpenAIError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw OpenAIError.apiError(statusCode: httpResponse.statusCode, message: errorBody)
        }

        struct ChatResponse: Codable {
            struct Choice: Codable {
                struct Message: Codable {
                    let content: String
                }
                let message: Message
            }
            let choices: [Choice]
        }

        let chatResponse = try JSONDecoder().decode(ChatResponse.self, from: data)
        guard let content = chatResponse.choices.first?.message.content else {
            throw OpenAIError.noContent
        }

        return content
    }
}

// MARK: - Errors

enum OpenAIError: LocalizedError {
    case missingAPIKey
    case invalidResponse
    case apiError(statusCode: Int, message: String)
    case noContent
    case noSubstantiveContent
    case timeout

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "OpenAI API key is not configured. Add it to Config.plist."
        case .invalidResponse:
            return "Invalid response from OpenAI API."
        case .apiError(let statusCode, let message):
            return "OpenAI API error (\(statusCode)): \(message)"
        case .noContent:
            return "No content in OpenAI response."
        case .noSubstantiveContent:
            return "Transcript contained no substantive memory content."
        case .timeout:
            return "Request timed out. Check your connection and try again."
        }
    }
}
