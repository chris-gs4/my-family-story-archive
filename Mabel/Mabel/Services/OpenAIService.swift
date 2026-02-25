import Foundation

class OpenAIService {
    static let shared = OpenAIService()

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

    // MARK: - Transcription (Whisper)

    func transcribeAudio(fileURL: URL) async throws -> String {
        guard !apiKey.isEmpty else {
            throw OpenAIError.missingAPIKey
        }

        let url = URL(string: "https://api.openai.com/v1/audio/transcriptions")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add model field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"model\"\r\n\r\n".data(using: .utf8)!)
        body.append("whisper-1\r\n".data(using: .utf8)!)

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

        let (data, response) = try await URLSession.shared.data(for: request)

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
        return whisperResponse.text
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
        """

        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
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

        let (data, response) = try await URLSession.shared.data(for: request)

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
        """

        let url = URL(string: "https://api.openai.com/v1/chat/completions")!
        var request = URLRequest(url: url)
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

        let (data, response) = try await URLSession.shared.data(for: request)

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

        let (data, response) = try await URLSession.shared.data(for: request)

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

        let (data, response) = try await URLSession.shared.data(for: request)

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
        }
    }
}
