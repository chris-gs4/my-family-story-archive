import Foundation

struct ChapterPrompts {
    static let prompts: [Int: [String]] = [
        1: [ // Childhood
            "What is your earliest memory?",
            "Describe the house you grew up in.",
            "What games did you play as a child?",
            "Who was your best friend growing up?",
            "What was your favorite thing to do after school?",
            "Describe a typical family dinner from your childhood.",
            "What was your favorite holiday as a kid?",
            "What did your neighborhood look like?",
            "What was your favorite toy or possession?",
            "Tell me about a time you got in trouble as a kid."
        ],
        2: [ // Family
            "Describe your mother in three words, then explain why.",
            "What is your favorite memory with your father?",
            "Tell me about your siblings and your relationship with them.",
            "What family traditions did you have?",
            "What values did your parents teach you?",
            "Describe a big family gathering you remember.",
            "Who in your family influenced you the most?",
            "What stories did your grandparents tell you?",
            "What was the funniest thing that happened in your family?",
            "How has your family changed over the years?"
        ],
        3: [ // School Days
            "Who was your favorite teacher and why?",
            "What subject did you love most in school?",
            "Tell me about your best friend in school.",
            "What was your most embarrassing moment at school?",
            "Did you play any sports or join any clubs?",
            "Describe your school building and classrooms.",
            "What did you want to be when you grew up?",
            "Tell me about a school project you were proud of.",
            "What was lunch time like at your school?",
            "How did you get to school each day?"
        ],
        4: [ // Coming of Age
            "When did you first feel like an adult?",
            "Tell me about your first job.",
            "What was the first big decision you made on your own?",
            "Describe a moment that changed how you saw the world.",
            "What music or movies defined your teenage years?",
            "Tell me about a time you stood up for yourself.",
            "What was your first car or mode of independence?",
            "Who were your role models as a teenager?",
            "What was the hardest part about growing up?",
            "Tell me about leaving home for the first time."
        ],
        5: [ // Love & Relationships
            "How did you meet your partner or closest friend?",
            "What is the most romantic thing you've ever done or received?",
            "Tell me about a friendship that shaped your life.",
            "What does love mean to you?",
            "Describe your first date.",
            "What is the best relationship advice you've received?",
            "Tell me about someone who surprised you with kindness.",
            "How do you show people you care about them?",
            "What have relationships taught you about yourself?",
            "Describe a moment of deep connection with someone."
        ],
        6: [ // Career & Purpose
            "What was your dream job as a child?",
            "Tell me about your first real job.",
            "What accomplishment are you most proud of professionally?",
            "Describe a mentor who shaped your career.",
            "What was a turning point in your career?",
            "Tell me about a failure that taught you something important.",
            "What does meaningful work look like to you?",
            "How did you balance work and personal life?",
            "What advice would you give someone starting their career?",
            "If you could do it all over, what would you change?"
        ],
        7: [ // Parenthood
            "What was it like when you first became a parent?",
            "What surprised you most about raising children?",
            "Tell me about a proud parenting moment.",
            "What values did you try to pass on to your children?",
            "Describe a typical day when your kids were young.",
            "What is the funniest thing your child ever said or did?",
            "How did parenthood change you as a person?",
            "What traditions did you create for your family?",
            "Tell me about a difficult parenting decision you had to make.",
            "What do you hope your children remember about growing up?"
        ],
        8: [ // Adventures
            "What is the most memorable trip you've ever taken?",
            "Tell me about a place that took your breath away.",
            "Describe an adventure that didn't go as planned.",
            "What is the bravest thing you've ever done?",
            "If you could revisit one place, where would it be?",
            "Tell me about a food or meal from your travels you'll never forget.",
            "What's the most spontaneous thing you've ever done?",
            "Describe a time you were completely outside your comfort zone.",
            "What's the longest journey you've ever taken?",
            "Tell me about a stranger you met while traveling."
        ],
        9: [ // Challenges
            "What is the hardest thing you've ever been through?",
            "Tell me about a time you almost gave up but didn't.",
            "How did you find strength during a difficult period?",
            "What did a setback teach you about yourself?",
            "Describe a loss that changed your perspective on life.",
            "Who helped you through your toughest times?",
            "What advice would you give to someone going through a hard time?",
            "Tell me about a challenge you're grateful for in hindsight.",
            "How did you rebuild after a major life change?",
            "What does resilience mean to you?"
        ],
        10: [ // Reflections
            "What are the three most important lessons life has taught you?",
            "If you could give your younger self one piece of advice, what would it be?",
            "What are you most grateful for in your life?",
            "How do you want to be remembered?",
            "What brings you the most joy today?",
            "What do you hope for the next generation?",
            "Tell me about a moment of pure happiness.",
            "What would you do differently if you could live your life again?",
            "What does a life well-lived look like to you?",
            "What message would you leave for your grandchildren?"
        ]
    ]

    static func getPrompts(for chapterID: Int, count: Int = 3) -> [String] {
        guard let chapterPrompts = prompts[chapterID] else { return [] }
        return Array(chapterPrompts.shuffled().prefix(count))
    }
}
