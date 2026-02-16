// Real OpenAI Service - Integrates with OpenAI GPT-4 API
// Implements the same interface as mock service for easy switching

import OpenAI from 'openai';

// Re-export types from mock service for consistency
export type {
  IntervieweeContext,
  GeneratedQuestion,
  QuestionWithResponse,
  TranscriptionResult,
  NarrativeResult,
} from './mock/openai';

import type {
  IntervieweeContext,
  GeneratedQuestion,
  QuestionWithResponse,
  TranscriptionResult,
  NarrativeResult,
} from './mock/openai';

// Journal-specific types
export interface JournalNarrativeResult {
  title: string;
  narrativeText: string;
  wordCount: number;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
  temperature: 0.7,
};

// Token usage tracking
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

class OpenAIService {
  private totalTokensUsed = 0;
  private totalCost = 0;

  /**
   * Generate interview questions based on interviewee context
   * For Module 1: Foundation questions
   */
  async generateQuestions(
    context: IntervieweeContext,
    count: number = 15
  ): Promise<GeneratedQuestion[]> {
    console.log(`[OpenAI] Generating ${count} foundation questions for ${context.name}`);

    const prompt = this.buildModule1Prompt(context, count);

    try {
      const response = await openai.chat.completions.create({
        model: CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.questionGeneration,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature,
      });

      // Track usage
      this.trackUsage(response.usage);

      // Parse response
      const questions = this.parseQuestionsFromResponse(
        response.choices[0].message.content || ''
      );

      console.log(
        `[OpenAI] Generated ${questions.length} questions using ${response.usage?.total_tokens} tokens`
      );

      return questions.slice(0, count);
    } catch (error) {
      console.error('[OpenAI] Error generating questions:', error);
      throw new Error(`Failed to generate questions: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Generate context-aware follow-up questions
   * For Module 2+: Build on previous responses
   */
  async generateFollowUpQuestions(
    context: IntervieweeContext,
    previousQuestions: QuestionWithResponse[],
    moduleNumber: number
  ): Promise<GeneratedQuestion[]> {
    console.log(
      `[OpenAI] Generating follow-up questions for Module ${moduleNumber}`
    );
    console.log(`[OpenAI] Analyzing ${previousQuestions.length} previous responses`);

    const prompt = this.buildFollowUpPrompt(context, previousQuestions, moduleNumber);

    try {
      const response = await openai.chat.completions.create({
        model: CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.followUpGeneration,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature,
      });

      // Track usage
      this.trackUsage(response.usage);

      // Parse response
      const questions = this.parseQuestionsFromResponse(
        response.choices[0].message.content || ''
      );

      console.log(
        `[OpenAI] Generated ${questions.length} follow-up questions using ${response.usage?.total_tokens} tokens`
      );

      return questions;
    } catch (error) {
      console.error('[OpenAI] Error generating follow-up questions:', error);
      throw new Error(
        `Failed to generate follow-up questions: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Generate narrative chapter from Q&A responses
   */
  async generateChapter(
    questions: QuestionWithResponse[],
    settings: {
      person?: 'first' | 'third';
      tone?: 'warm' | 'formal' | 'conversational';
      style?: 'descriptive' | 'concise' | 'poetic';
    } = {}
  ): Promise<string> {
    console.log(`[OpenAI] Generating chapter from ${questions.length} Q&A pairs`);

    const prompt = this.buildChapterPrompt(questions, settings);

    try {
      const response = await openai.chat.completions.create({
        model: CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.chapterGeneration,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: 0.8, // Slightly higher for creative narrative
      });

      // Track usage
      this.trackUsage(response.usage);

      const chapter = response.choices[0].message.content || '';

      console.log(
        `[OpenAI] Generated chapter (${chapter.split(' ').length} words) using ${response.usage?.total_tokens} tokens`
      );

      return chapter;
    } catch (error) {
      console.error('[OpenAI] Error generating chapter:', error);
      throw new Error(`Failed to generate chapter: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Generate image using DALL-E 3
   * For minimalist hand-drawn sketch illustrations
   */
  async generateImage(
    prompt: string,
    options: {
      size?: '1024x1024' | '1024x1792' | '1792x1024';
      quality?: 'standard' | 'hd';
      style?: 'natural' | 'vivid';
    } = {}
  ): Promise<{ url: string; revisedPrompt: string }> {
    console.log('[OpenAI] Generating image with DALL-E 3');
    console.log(`[OpenAI] Prompt: ${prompt.substring(0, 100)}...`);

    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';
    const style = options.style || 'natural';

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        style: style,
      });

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt || prompt;

      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      // Calculate cost (DALL-E 3 pricing)
      const cost = this.calculateImageCost(size, quality);
      this.totalCost += cost;

      console.log('\n' + '='.repeat(60));
      console.log('🎨 DALL-E 3 Image Generated');
      console.log('='.repeat(60));
      console.log(`📐 Size: ${size}`);
      console.log(`✨ Quality: ${quality}`);
      console.log(`🎭 Style: ${style}`);
      console.log(`💰 Cost This Call: $${cost.toFixed(4)}`);
      console.log(`📈 Session Total: $${this.totalCost.toFixed(4)}`);
      console.log('='.repeat(60) + '\n');

      return {
        url: imageUrl,
        revisedPrompt: revisedPrompt,
      };
    } catch (error) {
      console.error('[OpenAI] Error generating image:', error);
      throw new Error(`Failed to generate image: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Transcribe audio using Whisper API
   */
  async transcribeAudioFile(
    audioBuffer: Buffer,
    fileName: string = 'audio.webm',
    mimeType?: string
  ): Promise<TranscriptionResult> {
    console.log(`[OpenAI] Transcribing audio file: ${fileName}`);

    // Derive MIME type from file extension if not provided
    const resolvedMime = mimeType || this.mimeTypeFromFileName(fileName);

    try {
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: resolvedMime });
      const file = new File([blob], fileName, { type: resolvedMime });

      const response = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
        response_format: 'verbose_json',
      });

      const text = response.text;
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const duration = Math.round(response.duration || 0);

      console.log(`[OpenAI] Transcription complete: ${wordCount} words, ${duration}s`);

      return {
        text,
        duration,
        wordCount,
      };
    } catch (error) {
      console.error('[OpenAI] Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Generate a polished journal narrative with creative title from a raw transcript
   */
  async generateJournalNarrative(
    transcript: string
  ): Promise<JournalNarrativeResult> {
    console.log(`[OpenAI] Generating journal narrative from transcript (${transcript.length} chars)`);

    try {
      const response = await openai.chat.completions.create({
        model: CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.journalNarrative,
          },
          {
            role: 'user',
            content: `Transform this voice journal transcript into polished narrative prose with a creative title.

**Raw Transcript:**
${transcript}

**Return format:**
Return a JSON object with this structure:
{
  "title": "An evocative, creative title (not a literal summary)",
  "narrativeText": "The polished first-person narrative prose"
}

Return ONLY the JSON object, no additional text.`,
          },
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: 0.8,
      });

      this.trackUsage(response.usage);

      const content = response.choices[0].message.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const wordCount = parsed.narrativeText.split(/\s+/).filter(Boolean).length;

      console.log(`[OpenAI] Journal narrative generated: "${parsed.title}" (${wordCount} words)`);

      return {
        title: parsed.title,
        narrativeText: parsed.narrativeText,
        wordCount,
      };
    } catch (error) {
      console.error('[OpenAI] Error generating journal narrative:', error);
      throw new Error(`Failed to generate journal narrative: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get token usage stats
   */
  getUsageStats(): { totalTokens: number; estimatedCost: number } {
    return {
      totalTokens: this.totalTokensUsed,
      estimatedCost: this.totalCost,
    };
  }

  // Private helper methods

  private buildModule1Prompt(context: IntervieweeContext, count: number): string {
    const topicsText = context.topics.length > 0
      ? `Focus areas: ${context.topics.join(', ')}`
      : 'Cover a broad range of life experiences';

    return `Generate ${count} thoughtful interview questions for ${context.name}.

**Interviewee Profile:**
- Name: ${context.name}
- Relationship: ${context.relationship}
${context.birthYear ? `- Birth Year: ${context.birthYear} (age ~${new Date().getFullYear() - context.birthYear})` : ''}
${context.generation ? `- Generation: ${context.generation}` : ''}

**Focus:**
${topicsText}

**Requirements:**
- Generate EXACTLY ${count} questions
- Cover diverse categories: Early Life, Adolescence, Career, Relationships, Values, Legacy
- Make questions open-ended and conversational
- Personalize questions to ${context.name}'s profile
- Each question should invite detailed storytelling
- Avoid yes/no questions

**Format:**
Return ONLY a JSON array with this structure:
[
  {
    "question": "Question text here",
    "category": "Category name",
    "order": 1
  }
]

No additional text, only the JSON array.`;
  }

  private buildFollowUpPrompt(
    context: IntervieweeContext,
    previousQuestions: QuestionWithResponse[],
    moduleNumber: number
  ): string {
    // Extract themes and keywords from previous responses
    const responsesText = previousQuestions
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.response}`)
      .join('\n\n');

    return `Generate 15 follow-up questions for ${context.name}'s Module ${moduleNumber}.

**Context:**
${context.name} (${context.relationship}) has already answered these questions in previous modules:

${responsesText}

**Your Task:**
Analyze the responses above and generate 15 NEW questions that:
1. **Reference specific details** mentioned in previous answers
2. **Dive deeper** into interesting topics or themes
3. **Explore connections** between different aspects of their story
4. **Fill gaps** in the narrative timeline or relationships
5. **Build naturally** on what they've already shared

**Categories to explore:**
- Deep dives into mentioned topics
- Relationships and people referenced
- Turning points or significant moments
- Emotional experiences and growth
- Specific memories or anecdotes
- Lessons learned and wisdom gained

**Requirements:**
- Generate EXACTLY 15 questions
- Each question must connect to previous responses
- Use natural, conversational language
- Make questions specific, not generic
- Avoid repeating themes already thoroughly covered

**Format:**
Return ONLY a JSON array:
[
  {
    "question": "You mentioned [specific detail from response]. Can you tell me more about...",
    "category": "Category name",
    "order": 1
  }
]

No additional text, only the JSON array.`;
  }

  private buildChapterPrompt(
    questions: QuestionWithResponse[],
    settings: {
      person?: 'first' | 'third';
      tone?: 'warm' | 'formal' | 'conversational';
      style?: 'descriptive' | 'concise' | 'poetic';
    }
  ): string {
    const qaText = questions
      .map((q) => `Q: ${q.question}\nA: ${q.response}`)
      .join('\n\n');

    const person = settings.person || 'first';
    const tone = settings.tone || 'warm';
    const style = settings.style || 'descriptive';

    return `Transform these Q&A responses into a cohesive narrative chapter.

**Q&A Content:**
${qaText}

**Narrative Style:**
- Perspective: ${person}-person
- Tone: ${tone}
- Style: ${style}

**Requirements:**
1. Transform Q&A format into flowing narrative prose
2. Preserve ALL important details and stories
3. Maintain authentic voice and emotion
4. Create smooth transitions between topics
5. Structure with clear paragraphs (not sections/headings)
6. Write 800-1200 words
7. Make it engaging and emotionally resonant
8. Use vivid, specific language

**Important:**
- Do NOT add fictional details or embellish
- Use ONLY information from the responses
- Maintain the emotional tone of the original answers
- Write as a continuous narrative, not disconnected sections

Return ONLY the narrative text, no titles or formatting.`;
  }

  private parseQuestionsFromResponse(content: string): GeneratedQuestion[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      // Validate and normalize
      return questions.map((q, index) => ({
        question: q.question || '',
        category: q.category || 'General',
        order: q.order || index + 1,
      }));
    } catch (error) {
      console.error('[OpenAI] Failed to parse questions:', error);
      console.error('[OpenAI] Raw content:', content);
      throw new Error('Failed to parse AI response');
    }
  }

  private trackUsage(usage: OpenAI.Completions.CompletionUsage | undefined): void {
    if (!usage) return;

    this.totalTokensUsed += usage.total_tokens;

    // Estimate cost (GPT-4o-mini pricing as of 2024)
    // Input: $0.00015 per 1K tokens
    // Output: $0.0006 per 1K tokens
    const inputCost = (usage.prompt_tokens / 1000) * 0.00015;
    const outputCost = (usage.completion_tokens / 1000) * 0.0006;
    const cost = inputCost + outputCost;

    this.totalCost += cost;

    // Enhanced logging with visual formatting
    console.log('\n' + '='.repeat(60));
    console.log('📊 OpenAI API Call Complete');
    console.log('='.repeat(60));
    console.log(`🎯 Tokens Used: ${usage.total_tokens.toLocaleString()}`);
    console.log(`   └─ Prompt: ${usage.prompt_tokens.toLocaleString()}`);
    console.log(`   └─ Completion: ${usage.completion_tokens.toLocaleString()}`);
    console.log(`💰 Cost This Call: $${cost.toFixed(4)}`);
    console.log(`📈 Session Total: $${this.totalCost.toFixed(4)}`);
    console.log('='.repeat(60) + '\n');
  }

  private calculateImageCost(
    size: '1024x1024' | '1024x1792' | '1792x1024',
    quality: 'standard' | 'hd'
  ): number {
    // DALL-E 3 pricing (as of 2024)
    const pricing: Record<string, number> = {
      '1024x1024-standard': 0.04,
      '1024x1024-hd': 0.08,
      '1024x1792-standard': 0.08,
      '1024x1792-hd': 0.12,
      '1792x1024-standard': 0.08,
      '1792x1024-hd': 0.12,
    };

    const key = `${size}-${quality}`;
    return pricing[key] || 0.04;
  }

  private mimeTypeFromFileName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      webm: 'audio/webm',
      aac: 'audio/aac',
      mp4: 'audio/mp4',
      m4a: 'audio/mp4',
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
    };
    return mimeMap[ext || ''] || 'audio/webm';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

// System prompts
const SYSTEM_PROMPTS = {
  questionGeneration: `You are an expert interviewer specializing in capturing personal life stories and family histories. Your questions should:
- Be open-ended and invite detailed storytelling
- Feel natural and conversational, not formal or interrogative
- Show genuine interest and empathy
- Encourage reflection on meaning and emotions, not just facts
- Help people share stories they'll be proud to pass down

Generate questions that make people feel comfortable opening up about their lives.`,

  followUpGeneration: `You are an expert interviewer conducting a follow-up session. You've read previous interview responses and now want to dig deeper.

Your follow-up questions should:
- Reference specific details from previous answers ("You mentioned...")
- Explore interesting themes or patterns you noticed
- Ask for stories or examples related to broader statements
- Connect different aspects of their life story
- Show you've been listening carefully and care about their story

Make the interviewee feel heard and encourage them to expand on the most meaningful parts of their story.`,

  chapterGeneration: `You are a professional memoir writer and editor. Your task is to transform interview Q&A into beautifully written narrative prose.

Your narrative should:
- Flow naturally as a story, not feel like edited answers
- Preserve the authentic voice and emotional tone
- Use vivid, specific details from the responses
- Create smooth transitions between topics
- Maintain chronological or thematic coherence
- Feel intimate and personal
- Honor the person's story with care and respect

Write prose that the subject and their family will treasure.`,

  journalNarrative: `You are a skilled memoir editor helping someone turn their voice journal entries into polished narrative prose.

Your task:
1. Take a raw voice transcript (which may contain filler words, repetitions, incomplete sentences)
2. Transform it into beautiful first-person narrative prose
3. Generate a creative, evocative title that captures the emotional essence — not a literal summary

Guidelines:
- Write in first person, preserving the speaker's authentic voice
- Clean up speech patterns (remove "um", "uh", "like", repetitions) while keeping personality
- Maintain all factual details and emotional content
- Create flowing paragraphs, not bullet points
- The title should be poetic or evocative (e.g. "The Summer on Maple Street", "The Taste of Home")
- Keep the narrative concise — typically 150-400 words for a 3-5 minute recording
- Do NOT add fictional details or embellish beyond what was said
- Do NOT add a moral or lesson unless the speaker expressed one`,
};

// Singleton instance
export const openAIService = new OpenAIService();

// Export class for testing
export { OpenAIService };
