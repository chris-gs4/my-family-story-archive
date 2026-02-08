import type { ModuleQuestion, Interviewee } from '@prisma/client';

interface ResponseTemplate {
  category: string;
  templates: string[];
  keywords: string[];
}

const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    category: 'Early Life',
    templates: [
      "I grew up in {location} during the {era}. My childhood was filled with {activities}.",
      "My earliest memories are of {memory}. Life back then was {description}.",
      "We lived in a {house_type} with {family_members}. {additional_detail}",
      "I remember {memory} like it was yesterday. Those days were {description}.",
      "Growing up, I spent most of my time {activities}. It was a {description} childhood."
    ],
    keywords: ['childhood', 'grew up', 'family', 'home', 'school', 'early', 'young']
  },
  {
    category: 'Career',
    templates: [
      "I started my career in {year} as a {job}. It was {experience}.",
      "My first job was {job_description}. I learned {lessons}.",
      "I worked at {company} for {duration}. The most memorable part was {memory}.",
      "Working as a {job} taught me {lessons}. It was {experience}.",
      "My career path took me to {company} where I spent {duration} doing {job_description}."
    ],
    keywords: ['job', 'work', 'career', 'profession', 'employment', 'working']
  },
  {
    category: 'Family',
    templates: [
      "My family was {description}. We used to {activity} together.",
      "I remember {family_member} always {action}. It made me feel {emotion}.",
      "Family gatherings were {description}. My favorite memory is {memory}.",
      "{family_member} was special to me because {reason}. We would {activity} together.",
      "Growing up with my family meant {description}. I especially loved when we would {activity}."
    ],
    keywords: ['family', 'parents', 'siblings', 'relatives', 'home', 'mother', 'father']
  },
  {
    category: 'Relationships',
    templates: [
      "I met {person} in {year} at {location}. {story}",
      "My relationship with {person} taught me {lesson}.",
      "The most important person in my life was {person} because {reason}.",
      "{person} changed my life when {story}. I learned {lesson}.",
      "I'll never forget meeting {person}. {story}"
    ],
    keywords: ['met', 'friend', 'spouse', 'relationship', 'love', 'partner']
  },
  {
    category: 'Education',
    templates: [
      "I attended {location} where I studied {activities}. It was {experience}.",
      "School was {description} for me. I particularly enjoyed {activities}.",
      "My education taught me {lessons}. I remember {memory} most clearly.",
      "I graduated in {year} after studying {activities}. {story}",
      "My time at {location} was {experience}. {additional_detail}"
    ],
    keywords: ['school', 'education', 'college', 'university', 'studied', 'learning']
  },
  {
    category: 'Hobbies',
    templates: [
      "I've always loved {activities}. It brings me {emotion}.",
      "In my free time, I enjoy {activities}. I started {story}.",
      "My favorite hobby is {activities}. {additional_detail}",
      "I spend a lot of time {activities}. It's {description}.",
      "One of my passions is {activities}. I learned {lessons}."
    ],
    keywords: ['hobby', 'hobbies', 'pastime', 'enjoy', 'free time', 'leisure']
  },
  {
    category: 'Challenges',
    templates: [
      "One of the hardest times was {memory}. I learned {lessons}.",
      "I faced a challenge when {story}. It taught me {lessons}.",
      "The most difficult period was {description}. But {additional_detail}",
      "I overcame {memory} by {action}. It made me {emotion}.",
      "Looking back, {memory} was tough, but {lessons}."
    ],
    keywords: ['challenge', 'difficult', 'hard', 'struggle', 'overcome', 'problem']
  },
  {
    category: 'Values',
    templates: [
      "I've always believed in {lessons}. {family_member} taught me this.",
      "What matters most to me is {lessons}. I learned this through {story}.",
      "My values come from {memory}. They guide me to {action}.",
      "I think {lessons} is important because {reason}.",
      "{family_member} always said {lessons}. I still live by that today."
    ],
    keywords: ['believe', 'value', 'important', 'principle', 'faith', 'religion']
  }
];

/**
 * Generate mock responses for an array of questions
 */
export function generateMockResponses(
  questions: ModuleQuestion[],
  interviewee: Interviewee,
  moduleNumber: number
): Array<{ questionId: string; response: string }> {

  return questions.map((q, index) => {
    const template = findMatchingTemplate(q.category, q.question);
    const response = generateResponseFromTemplate(template, interviewee, moduleNumber, index);

    return {
      questionId: q.id,
      response
    };
  });
}

/**
 * Find the best matching template based on category and question keywords
 */
function findMatchingTemplate(category: string, question: string): ResponseTemplate {
  const questionLower = question.toLowerCase();

  // First try exact category match
  let match = RESPONSE_TEMPLATES.find(t =>
    t.category.toLowerCase() === category.toLowerCase()
  );

  // If no category match, try keyword matching
  if (!match) {
    match = RESPONSE_TEMPLATES.find(t =>
      t.keywords.some(k => questionLower.includes(k))
    );
  }

  // Default to Early Life template
  return match || RESPONSE_TEMPLATES[0];
}

/**
 * Generate a response by filling in template placeholders
 */
function generateResponseFromTemplate(
  template: ResponseTemplate,
  interviewee: Interviewee,
  moduleNumber: number,
  index: number
): string {
  // Pick a template (cycle through available templates)
  const templateText = template.templates[index % template.templates.length];

  // Fill in placeholders with contextual data
  let response = templateText
    .replace('{location}', getRandomLocation())
    .replace('{era}', getEra(interviewee.birthYear))
    .replace('{activities}', getRandomActivities())
    .replace('{memory}', getRandomMemory())
    .replace('{description}', getRandomDescription())
    .replace('{house_type}', getRandomHouseType())
    .replace('{family_members}', 'my parents and siblings')
    .replace('{additional_detail}', getRandomDetail())
    .replace('{year}', String((interviewee.birthYear || 1960) + 22))
    .replace('{job}', getRandomJob())
    .replace('{experience}', getRandomExperience())
    .replace('{job_description}', getRandomJobDescription())
    .replace('{lessons}', getRandomLesson())
    .replace('{lesson}', getRandomLesson())
    .replace('{company}', getRandomCompany())
    .replace('{duration}', getRandomDuration())
    .replace('{activity}', getRandomFamilyActivity())
    .replace('{family_member}', getRandomFamilyMember())
    .replace('{action}', getRandomAction())
    .replace('{emotion}', getRandomEmotion())
    .replace('{person}', getRandomPerson())
    .replace('{story}', getRandomStory())
    .replace('{reason}', getRandomReason());

  // Add variety in length (make some responses longer for realism)
  if (index % 3 === 0) {
    response += ` ${getRandomDetail()}`;
  }

  // Occasionally add a second sentence for depth
  if (index % 4 === 1) {
    response += ` ${getSecondSentence()}`;
  }

  return response;
}

// ============================================================================
// Helper functions for realistic content generation
// ============================================================================

function getRandomLocation(): string {
  const locations = [
    'Boston', 'Chicago', 'Portland', 'Austin', 'Denver',
    'Seattle', 'Philadelphia', 'San Diego', 'Minneapolis', 'Nashville'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function getEra(birthYear: number | null): string {
  if (!birthYear) return 'the 1960s';
  const decade = Math.floor(birthYear / 10) * 10;
  return `the ${decade}s`;
}

function getRandomActivities(): string {
  const activities = [
    'playing outside with neighborhood kids',
    'reading books',
    'exploring the woods',
    'building forts',
    'riding bikes',
    'helping around the house',
    'visiting relatives',
    'going to the library'
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}

function getRandomMemory(): string {
  const memories = [
    'summer vacations at the lake',
    'Sunday dinners with grandparents',
    'learning to ride a bike',
    'holiday celebrations',
    'family road trips',
    'my first day of school',
    'helping in the garden',
    'Saturday morning cartoons'
  ];
  return memories[Math.floor(Math.random() * memories.length)];
}

function getRandomDescription(): string {
  const descriptions = [
    'simple but happy',
    'full of love and laughter',
    'challenging but meaningful',
    'peaceful and close-knit',
    'busy and exciting',
    'quiet and reflective',
    'adventurous and fun',
    'traditional and structured'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomHouseType(): string {
  const types = ['small house', 'apartment', 'farmhouse', 'two-story home', 'duplex', 'ranch-style house'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomDetail(): string {
  const details = [
    'Those were simpler times.',
    'I wouldn\'t trade those memories for anything.',
    'It shaped who I am today.',
    'I still think about it often.',
    'Those days left a lasting impression on me.'
  ];
  return details[Math.floor(Math.random() * details.length)];
}

function getRandomJob(): string {
  const jobs = [
    'teacher', 'engineer', 'salesperson', 'accountant', 'manager',
    'nurse', 'technician', 'clerk', 'supervisor', 'consultant'
  ];
  return jobs[Math.floor(Math.random() * jobs.length)];
}

function getRandomExperience(): string {
  const experiences = [
    'challenging but rewarding',
    'a great learning experience',
    'both exciting and scary',
    'the start of something wonderful',
    'exactly what I needed at the time',
    'harder than I expected',
    'better than I could have imagined',
    'a formative experience'
  ];
  return experiences[Math.floor(Math.random() * experiences.length)];
}

function getRandomJobDescription(): string {
  const descriptions = [
    'working at a local store',
    'helping in my father\'s business',
    'doing office work',
    'serving in the military',
    'working at a factory',
    'teaching at a school',
    'helping customers',
    'managing a small team'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomLesson(): string {
  const lessons = [
    'the importance of hard work',
    'how to be patient',
    'to never give up',
    'the value of honesty',
    'to treat others with respect',
    'that family comes first',
    'to appreciate what you have',
    'the power of perseverance'
  ];
  return lessons[Math.floor(Math.random() * lessons.length)];
}

function getRandomCompany(): string {
  const companies = [
    'a small firm', 'a large corporation', 'a family business',
    'a local company', 'a startup', 'a well-established organization'
  ];
  return companies[Math.floor(Math.random() * companies.length)];
}

function getRandomDuration(): string {
  const durations = ['5 years', '10 years', '2 years', 'many years', '3 years', 'over a decade'];
  return durations[Math.floor(Math.random() * durations.length)];
}

function getRandomFamilyActivity(): string {
  const activities = [
    'go on picnics', 'play board games', 'tell stories', 'cook meals',
    'take walks', 'watch movies', 'visit parks', 'celebrate holidays'
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}

function getRandomFamilyMember(): string {
  const members = ['my father', 'my mother', 'my grandmother', 'my grandfather', 'my sibling', 'my aunt'];
  return members[Math.floor(Math.random() * members.length)];
}

function getRandomAction(): string {
  const actions = [
    'told stories', 'sang songs', 'made us laugh', 'gave wise advice',
    'cooked delicious meals', 'played music', 'shared their wisdom', 'made everything fun'
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function getRandomEmotion(): string {
  const emotions = [
    'loved and safe', 'happy and content', 'proud and grateful',
    'warm inside', 'appreciated', 'understood', 'confident', 'hopeful'
  ];
  return emotions[Math.floor(Math.random() * emotions.length)];
}

function getRandomPerson(): string {
  const people = ['my spouse', 'my best friend', 'my mentor', 'a colleague', 'a neighbor', 'a teacher'];
  return people[Math.floor(Math.random() * people.length)];
}

function getRandomStory(): string {
  const stories = [
    'It was a turning point in my life.',
    'That moment changed everything for me.',
    'I\'ll never forget that day.',
    'It taught me so much about myself.',
    'Looking back, it was meant to be.',
    'That experience opened new doors for me.'
  ];
  return stories[Math.floor(Math.random() * stories.length)];
}

function getRandomReason(): string {
  const reasons = [
    'they believed in me',
    'they were always there for me',
    'they taught me so much',
    'they changed my life',
    'they showed me what was possible',
    'they never gave up on me'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getSecondSentence(): string {
  const sentences = [
    'Looking back now, I realize how much that experience shaped who I am today.',
    'I carry those lessons with me even now.',
    'It\'s something I\'ll always treasure.',
    'Those memories are precious to me.',
    'I often think about how different things were back then.',
    'Time has a way of making you appreciate these moments more.'
  ];
  return sentences[Math.floor(Math.random() * sentences.length)];
}
