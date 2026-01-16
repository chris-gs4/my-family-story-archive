// Mock OpenAI Service for Development
// Simulates OpenAI API responses without needing real API keys

interface IntervieweeContext {
  name: string;
  relationship: string;
  birthYear?: number;
  generation?: string;
  topics: string[];
}

interface GeneratedQuestion {
  question: string;
  category: string;
  order: number;
  followUps?: string[];
}

interface TranscriptionResult {
  text: string;
  duration: number;
  wordCount: number;
}

interface NarrativeResult {
  content: string;
  structure: {
    chapters: Array<{ title: string; startPage: number }>;
  };
  wordCount: number;
}

class MockOpenAIService {
  /**
   * Generate mock interview questions based on interviewee context
   */
  async generateQuestions(
    context: IntervieweeContext,
    count: number = 20
  ): Promise<GeneratedQuestion[]> {
    console.log(`[Mock OpenAI] Generating ${count} questions for ${context.name}`);

    // Simulate API delay
    await this.delay(2000);

    const questionTemplates = this.getQuestionTemplates(context);

    // Select and customize questions based on topics
    const questions: GeneratedQuestion[] = [];
    let order = 1;

    for (const template of questionTemplates.slice(0, count)) {
      questions.push({
        ...template,
        order: order++,
        question: this.personalizeQuestion(template.question, context),
      });
    }

    console.log(`[Mock OpenAI] Generated ${questions.length} personalized questions`);
    return questions;
  }

  /**
   * Mock audio transcription
   */
  async transcribeAudio(audioFileKey: string, duration: number): Promise<TranscriptionResult> {
    console.log(`[Mock OpenAI] Transcribing audio: ${audioFileKey}`);
    console.log(`[Mock OpenAI] Duration: ${duration} seconds`);

    // Simulate transcription delay (1 second per minute of audio)
    const delayMs = Math.max(1000, (duration / 60) * 1000);
    await this.delay(delayMs);

    const transcript = this.generateMockTranscript(duration);
    const wordCount = transcript.split(/\s+/).length;

    console.log(`[Mock OpenAI] Transcription complete: ${wordCount} words`);

    return {
      text: transcript,
      duration,
      wordCount,
    };
  }

  /**
   * Generate narrative from transcript
   */
  async generateNarrative(
    transcript: string,
    style: string = 'first-person'
  ): Promise<NarrativeResult> {
    console.log(`[Mock OpenAI] Generating ${style} narrative`);
    console.log(`[Mock OpenAI] Transcript length: ${transcript.length} characters`);

    // Simulate processing delay
    await this.delay(3000);

    const narrative = this.generateMockNarrative(transcript, style);
    const wordCount = narrative.split(/\s+/).length;

    console.log(`[Mock OpenAI] Narrative generated: ${wordCount} words`);

    return {
      content: narrative,
      structure: {
        chapters: [
          { title: 'The Early Years', startPage: 1 },
          { title: 'Growing Up', startPage: 3 },
          { title: 'Life Lessons', startPage: 6 },
          { title: 'Looking Forward', startPage: 9 },
        ],
      },
      wordCount,
    };
  }

  // Private helper methods

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private personalizeQuestion(question: string, context: IntervieweeContext): string {
    return question
      .replace('[NAME]', context.name)
      .replace('[RELATIONSHIP]', context.relationship)
      .replace('[GENERATION]', context.generation || 'your generation');
  }

  private getQuestionTemplates(context: IntervieweeContext): GeneratedQuestion[] {
    const allQuestions: GeneratedQuestion[] = [
      // Early Life & Childhood
      {
        question: 'What are your earliest memories of growing up?',
        category: 'Early Life & Childhood',
        order: 1,
        followUps: [
          'Can you describe the house or place where you grew up?',
          'What did a typical day look like when you were young?',
          'Who were the most important people in your early life?',
        ],
      },
      {
        question: 'Tell me about your family. What were your parents like?',
        category: 'Early Life & Childhood',
        order: 2,
        followUps: [
          'What values did your parents teach you?',
          'Do you have any siblings? What was that relationship like?',
        ],
      },
      {
        question: 'What was school like for you?',
        category: 'Adolescence & Education',
        order: 3,
        followUps: [
          'Did you have a favorite teacher or subject?',
          'What activities or interests did you pursue?',
        ],
      },

      // Adolescence
      {
        question: 'What did you dream of becoming when you were young?',
        category: 'Adolescence & Education',
        order: 4,
        followUps: [
          'How did those dreams change over time?',
          'What influenced your aspirations?',
        ],
      },
      {
        question: 'Tell me about your teenage years. What were they like?',
        category: 'Adolescence & Education',
        order: 5,
        followUps: [
          'What were the biggest challenges you faced?',
          'What are your favorite memories from that time?',
        ],
      },

      // Career & Work
      {
        question: 'Tell me about your first real job.',
        category: 'Career & Work Life',
        order: 6,
        followUps: [
          'What did you learn from that experience?',
          'How did it shape your career path?',
        ],
      },
      {
        question: 'What has been your proudest professional accomplishment?',
        category: 'Career & Work Life',
        order: 7,
        followUps: [
          'What obstacles did you have to overcome?',
          'How did this achievement impact your life?',
        ],
      },
      {
        question: 'What was the most challenging period in your career?',
        category: 'Career & Work Life',
        order: 8,
        followUps: [
          'How did you get through it?',
          'What did that experience teach you?',
        ],
      },

      // Relationships & Family
      {
        question: 'How did you meet your spouse/partner?',
        category: 'Relationships & Family',
        order: 9,
        followUps: [
          'What attracted you to them?',
          'Can you describe your first date or early days together?',
        ],
      },
      {
        question: 'What has been the most important relationship in your life?',
        category: 'Relationships & Family',
        order: 10,
        followUps: [
          'How has this person influenced who you are today?',
          'What lessons did you learn from this relationship?',
        ],
      },
      {
        question: 'Tell me about becoming a parent (if applicable).',
        category: 'Relationships & Family',
        order: 11,
        followUps: [
          'How did it change your perspective on life?',
          'What has been the most rewarding part of parenthood?',
        ],
      },

      // Values & Beliefs
      {
        question: 'What principles or values have guided your life?',
        category: 'Values & Beliefs',
        order: 12,
        followUps: [
          'Where did these values come from?',
          'Have they changed over time?',
        ],
      },
      {
        question: 'What has been the most important lesson you\'ve learned in life?',
        category: 'Values & Beliefs',
        order: 13,
        followUps: [
          'How did you learn this lesson?',
          'How has it influenced your decisions?',
        ],
      },

      // Legacy & Reflection
      {
        question: 'Looking back, what are you most proud of?',
        category: 'Legacy & Reflection',
        order: 14,
        followUps: [
          'Is there anything you wish you had done differently?',
          'What would you tell your younger self?',
        ],
      },
      {
        question: 'What do you hope people will remember about you?',
        category: 'Legacy & Reflection',
        order: 15,
        followUps: [
          'What legacy do you want to leave behind?',
          'What advice would you give to future generations?',
        ],
      },

      // Topic-specific questions
      {
        question: 'Tell me about a time that significantly shaped who you are today.',
        category: 'Life Experiences',
        order: 16,
        followUps: [
          'What made this moment so impactful?',
          'How did it change your perspective?',
        ],
      },
      {
        question: 'What traditions or customs are most important to you?',
        category: 'Traditions & Culture',
        order: 17,
        followUps: [
          'Where do these traditions come from?',
          'How have you passed them on?',
        ],
      },
      {
        question: 'Tell me about a challenge or hardship you overcame.',
        category: 'Challenges & Growth',
        order: 18,
        followUps: [
          'What helped you get through it?',
          'What did you discover about yourself?',
        ],
      },
      {
        question: 'What brings you the most joy in life?',
        category: 'Values & Beliefs',
        order: 19,
        followUps: [
          'When did you discover this source of joy?',
          'How has it sustained you over the years?',
        ],
      },
      {
        question: 'If you could share one piece of wisdom, what would it be?',
        category: 'Legacy & Reflection',
        order: 20,
        followUps: [
          'Where does this wisdom come from?',
          'When have you seen this truth proven in your life?',
        ],
      },
    ];

    // Filter based on topics if specific ones are mentioned
    if (context.topics.length > 0) {
      const topicKeywords = context.topics.map((t) => t.toLowerCase());
      return allQuestions.filter((q) => {
        const questionLower = q.question.toLowerCase() + q.category.toLowerCase();
        return topicKeywords.some((keyword) => questionLower.includes(keyword));
      }).concat(allQuestions.slice(0, 15)); // Always include some general questions
    }

    return allQuestions;
  }

  private generateMockTranscript(duration: number): string {
    // Generate a realistic mock transcript
    return `Well, I remember it was a beautiful spring day in 1965. I was just seven years old at the time.

My family lived in a small house on Maple Street, right at the edge of town. It wasn't much, but it was home. My father worked at the factory, and my mother took care of us kids. There were four of us - me, my older brother Tom, and my two younger sisters, Mary and Beth.

I remember my mother always had flowers growing in the front yard. Roses, mostly. She loved those roses. She'd spend hours tending to them, talking to them like they were her children too. [laughs]

The neighborhood was different back then. Kids played outside until the streetlights came on. We'd ride our bikes everywhere, play stickball in the street, and nobody worried. It was a different time.

My father... he was a quiet man. Worked hard every day, came home tired, but he always had time to throw the ball around or help with homework. He taught me the value of hard work, of keeping your word. Those lessons stuck with me my whole life.

School was about a mile away, and we walked there every day, rain or shine. My favorite teacher was Mrs. Henderson in the third grade. She made learning fun, always encouraging us to ask questions and think for ourselves.

Those were simpler times, you know? We didn't have much, but we had each other. And that was enough.`;
  }

  private generateMockNarrative(transcript: string, style: string): string {
    if (style === 'third-person') {
      return `The Early Years

The memories begin on a beautiful spring day in 1965, when they were just seven years old. Life was centered around a small house on Maple Street, perched at the edge of town. It wasn't much to look at, but it was filled with warmth and love.

Their father worked long hours at the factory, while their mother dedicated herself to raising four children. The household buzzed with activity - an older brother Tom, and two younger sisters, Mary and Beth. Each day brought new adventures and challenges.

Growing Up

The front yard was their mother's pride and joy, especially the roses she tended with such care. She would spend hours among those flowers, nurturing them as lovingly as she did her children. It was a lesson in patience and dedication that wouldn't be forgotten.

The neighborhood was a child's paradise. Freedom reigned as kids rode bikes through winding streets, played stickball until dusk, and gathered when the streetlights flickered to life. There was an innocence to those times, a sense of community that seemed to wrap around everyone like a warm blanket.

Life Lessons

Their father, though quiet, was a pillar of strength and wisdom. Despite the exhaustion from long days at work, he always found energy to play catch or help with homework. His lessons about hard work and integrity became the foundation of their character.

The daily mile-long walk to school was an adventure in itself. Through rain and shine, they made that journey, building resilience with each step. Mrs. Henderson's third-grade classroom became a sanctuary of learning, where questions were encouraged and curiosity was nurtured.

Looking Forward

Looking back, those times might have been simpler, but they were rich in the things that truly matter. Material possessions were few, but family bonds were strong. It was enough. More than enough. Those early experiences shaped the person they would become, teaching lessons about love, hard work, and community that would last a lifetime.`;
    }

    // First-person narrative
    return `The Early Years

I remember it was a beautiful spring day in 1965. I was just seven years old at the time, living in a small house on Maple Street, right at the edge of town. It wasn't much, but it was home - filled with love, laughter, and the constant energy of four kids running around.

My father worked long hours at the factory, and my mother dedicated herself to raising us. There was me, my older brother Tom, and my two younger sisters, Mary and Beth. We didn't have much, but we had each other.

Growing Up

My mother's roses are one of my most vivid memories. She would spend hours in the front yard, tending to those flowers with such care and attention. I'd watch her talking to them, treating them almost like they were part of the family. Looking back, I realize she was teaching me about patience and nurturing, though I didn't understand it at the time.

The neighborhood was magical for a child. We had the kind of freedom that seems impossible today. We'd ride our bikes everywhere, play stickball in the street, and stay out until the streetlights came on. Nobody worried because everybody looked out for everyone else's kids. It was a different time.

Life Lessons

My father was a quiet man, but his presence was powerful. Despite coming home exhausted from the factory every day, he always found time for us. Whether it was throwing the ball around or helping with homework, he was there. He taught me the value of hard work, of keeping your word, of doing what's right even when it's hard. Those lessons stuck with me my whole life.

Every day, we walked a mile to school, rain or shine. That daily journey taught me more than I realized at the time - about perseverance, about finding joy in simple things, about the importance of showing up. Mrs. Henderson's third-grade classroom was my sanctuary. She made learning exciting, always encouraging us to ask questions and think for ourselves.

Looking Forward

Those were simpler times, I know that now. We didn't have much in terms of material things, but we had something more valuable - community, family, and love. That was enough. More than enough, really.

Looking back on those early years, I'm grateful for the foundation they gave me. The values I learned, the love I felt, the sense of belonging - these things shaped who I am today. And I hope I've been able to pass some of that on to the next generation.`;
  }
}

// Singleton instance
export const mockOpenAI = new MockOpenAIService();

// Export types
export type {
  IntervieweeContext,
  GeneratedQuestion,
  TranscriptionResult,
  NarrativeResult,
};
