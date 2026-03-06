import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for the complete Mabel pipeline E2E test.
 * Creates "Grandma Rose's Story" with 4 modules in various states.
 */
export async function seedMabelPipelineTest(userId?: string) {
  console.log('🌱 Seeding Mabel Pipeline Test Data');
  console.log('═'.repeat(60));

  // Get user
  let user;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }

  if (!user) {
    console.log('No user found. Create one first.');
    return null;
  }

  console.log(`Using user: ${user.email || user.id}\n`);

  // Create project
  const project = await prisma.project.create({
    data: {
      title: "Grandma Rose's Story",
      userId: user.id,
      status: 'DRAFT',
      currentModuleNumber: 4,
      totalModulesCompleted: 1,
      bookTitle: "Grandma Rose's Story",
      interviewee: {
        create: {
          name: 'Rose Fitzgerald',
          relationship: 'grandmother',
          birthYear: 1942,
          generation: 'Silent Generation',
          topics: ['childhood', 'family', 'school', 'coming of age'],
          notes: 'Grew up in a small Irish-American neighborhood in Boston.',
        },
      },
    },
    include: { interviewee: true },
  });

  console.log(`Project: ${project.id} - "${project.title}"`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE 1: "Childhood" — APPROVED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const mod1 = await prisma.module.create({
    data: {
      projectId: project.id,
      moduleNumber: 1,
      title: 'Childhood',
      status: 'APPROVED',
      theme: 'Early years and family home',
      approvedAt: new Date('2026-02-25'),
    },
  });

  const mod1Questions = [
    { q: 'What is your earliest memory?', cat: 'Early Life', resp: 'My earliest memory is sitting on my grandfather\'s lap on the front porch of our house on Elm Street. He was smoking his pipe and telling me about the ships he used to see in Boston Harbor. I must have been three or four years old, but I can still smell that sweet tobacco.' },
    { q: 'What was your childhood home like?', cat: 'Home', resp: 'We lived in a three-decker in Dorchester — a classic Boston triple-decker with wooden porches stacked up the back. Our family had the middle floor. The kitchen was the heart of everything, with a big cast-iron radiator that clanked and hissed all winter long.' },
    { q: 'Who was the most influential person in your early years?', cat: 'Family', resp: 'Without question, my mother. She was the strongest woman I ever knew. She raised six children while working part-time at the parish rectory. She never complained, but I could see how tired she was. She taught me that love is what you do, not what you say.' },
    { q: 'What games did you play as a child?', cat: 'Play', resp: 'We played stickball in the street, kick the can, and red rover. In summer we\'d run through the fire hydrants when someone opened them up. We didn\'t have much in the way of toys, but we had the whole neighborhood as our playground.' },
    { q: 'What was a typical Sunday like in your family?', cat: 'Traditions', resp: 'Sunday was church day — 9 AM Mass at St. Margaret\'s, no exceptions. Then my mother would cook a big roast dinner. The whole family would gather, aunts and uncles and cousins. After dinner, the men would listen to the Red Sox game on the radio while the women cleaned up. It was the one day that felt truly peaceful.' },
    { q: 'What foods remind you of your childhood?', cat: 'Food', resp: 'My mother\'s brown bread — she baked it every Saturday. Corned beef and cabbage, of course, and her famous apple cake. The smell of that bread coming out of the oven is the smell of home to me, even now after all these years.' },
  ];

  for (let i = 0; i < mod1Questions.length; i++) {
    await prisma.moduleQuestion.create({
      data: {
        moduleId: mod1.id,
        question: mod1Questions[i].q,
        category: mod1Questions[i].cat,
        order: i + 1,
        response: mod1Questions[i].resp,
        respondedAt: new Date('2026-02-24'),
        processingStatus: 'COMPLETE',
        rawTranscript: mod1Questions[i].resp,
        narrativeText: mod1Questions[i].resp,
        duration: 45 + Math.floor(Math.random() * 60),
        contextSource: 'initial',
      },
    });
  }

  // Chapter for module 1
  await prisma.moduleChapter.create({
    data: {
      moduleId: mod1.id,
      content: `# Childhood\n\nMy earliest memory is a simple one, but it carries the weight of a whole world. I was sitting on my grandfather's lap on the front porch of our house on Elm Street, watching the evening settle over Dorchester. He was smoking his pipe — that sweet, warm tobacco smell that I still catch sometimes in a crowded room and have to stop for a moment, caught between then and now.\n\nWe lived in a three-decker, one of those classic Boston triple-deckers with wooden porches stacked up the back like a wedding cake. Our family had the middle floor. The kitchen was the heart of everything — a big room with a cast-iron radiator that clanked and hissed all winter long, as if the house itself was breathing.\n\nMy mother was the center of that kitchen and the center of our lives. She was the strongest woman I ever knew. Raising six children while working part-time at the parish rectory, she never complained — though I could see the tiredness in her eyes at the end of the day. She taught me the most important lesson of my life: that love is what you do, not what you say.\n\nWe didn't have much in the way of toys, but we had the whole neighborhood as our playground. Stickball in the street, kick the can in the twilight, red rover until someone's mother called them in for supper. In summer, someone would open up a fire hydrant and we'd run shrieking through the water, our clothes soaking, our laughter echoing off the brick buildings.\n\nSundays were sacred — 9 AM Mass at St. Margaret's, no exceptions. Then my mother would cook a big roast dinner, and the whole family would gather: aunts and uncles and cousins filling every chair and corner. After dinner, the men would listen to the Red Sox game on the radio while the women cleaned up, their conversation and laughter drifting through the rooms like music.\n\nAnd the food — oh, the food. My mother's brown bread, baked every Saturday without fail. Corned beef and cabbage. Her famous apple cake. The smell of that bread coming out of the oven is the smell of home to me, even now, after all these years. Some things you carry with you forever, and the memory of that kitchen — warm, crowded, alive — is one of mine.`,
      wordCount: 356,
      version: 1,
      narrativePerson: 'first-person',
      narrativeTone: 'warm',
      narrativeStyle: 'descriptive',
    },
  });

  console.log('  Module 1 "Childhood" — APPROVED with chapter');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE 2: "Family" — IN_PROGRESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const mod2 = await prisma.module.create({
    data: {
      projectId: project.id,
      moduleNumber: 2,
      title: 'Family',
      status: 'IN_PROGRESS',
      theme: 'Parents, siblings, and extended family',
    },
  });

  const mod2Questions = [
    { q: 'Tell me about your parents. What were they like?', cat: 'Parents', resp: 'My father was a quiet man who worked at the shipyard. He had strong hands and gentle eyes. My mother was the talker of the family — she could make friends with anyone. Together they made a good team.', status: 'COMPLETE' },
    { q: 'How many siblings did you have? What was your relationship like?', cat: 'Siblings', resp: 'I was the third of six children. My older brother Tommy was my protector, and my younger sister Mary was my best friend. We fought like cats and dogs but would defend each other to the death.', status: 'COMPLETE' },
    { q: 'What family traditions were most important to you?', cat: 'Traditions', resp: null, status: 'ERROR', errorMsg: 'Transcription failed: audio quality too low' },
    { q: 'What values did your family emphasize?', cat: 'Values', resp: null, status: null },
    { q: 'Tell me about a memorable family gathering or holiday.', cat: 'Gatherings', resp: null, status: null },
    { q: 'What stories were passed down in your family?', cat: 'Stories', resp: null, status: null },
  ];

  for (let i = 0; i < mod2Questions.length; i++) {
    const mq = mod2Questions[i];
    await prisma.moduleQuestion.create({
      data: {
        moduleId: mod2.id,
        question: mq.q,
        category: mq.cat,
        order: i + 1,
        response: mq.resp,
        respondedAt: mq.resp ? new Date('2026-02-27') : null,
        processingStatus: mq.status,
        rawTranscript: mq.resp,
        narrativeText: mq.resp,
        errorMessage: mq.status === 'ERROR' ? (mq as { errorMsg?: string }).errorMsg : null,
        duration: mq.resp ? 35 + Math.floor(Math.random() * 40) : null,
        audioFileKey: mq.status ? `journal-audio/mock-mod2-q${i + 1}.m4a` : null,
        contextSource: 'module_1',
      },
    });
  }

  console.log('  Module 2 "Family" — IN_PROGRESS (2 complete, 1 error, 3 unanswered)');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE 3: "School Days" — CHAPTER_GENERATED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const mod3 = await prisma.module.create({
    data: {
      projectId: project.id,
      moduleNumber: 3,
      title: 'School Days',
      status: 'CHAPTER_GENERATED',
      theme: 'Education and early friendships',
    },
  });

  const mod3Questions = [
    { q: 'What was your first day of school like?', cat: 'School', resp: 'I remember holding my mother\'s hand so tight walking up to St. Margaret\'s School. The building seemed enormous. Sister Agnes was our teacher — she was strict but fair. I cried when my mother left, but by lunchtime I had made my first friend, a girl named Dorothy.' },
    { q: 'Who was your favorite teacher and why?', cat: 'Teachers', resp: 'Mr. O\'Brien, my eighth-grade teacher. He was the first person outside my family who told me I was smart. He encouraged me to read widely and to never be afraid of asking questions. I think about him every time I pick up a book.' },
    { q: 'What subjects did you enjoy the most?', cat: 'Academics', resp: 'English and history. I loved writing compositions and reading stories. History made the world feel bigger than our neighborhood. Math was my weakness — I could never quite wrap my head around algebra.' },
    { q: 'Tell me about your closest school friends.', cat: 'Friends', resp: 'Dorothy Callahan was my dearest friend from first grade through high school. We did everything together — walked to school, shared lunches, told each other our secrets. She married young and moved to New York, but we wrote letters for years.' },
    { q: 'What was discipline like at school?', cat: 'Discipline', resp: 'The nuns didn\'t tolerate nonsense. If you talked out of turn, you got a rap on the knuckles with a ruler. Once I got sent to the principal\'s office for passing notes — I was terrified my mother would find out. Compared to today it seems harsh, but we learned respect.' },
  ];

  for (let i = 0; i < mod3Questions.length; i++) {
    await prisma.moduleQuestion.create({
      data: {
        moduleId: mod3.id,
        question: mod3Questions[i].q,
        category: mod3Questions[i].cat,
        order: i + 1,
        response: mod3Questions[i].resp,
        respondedAt: new Date('2026-02-26'),
        processingStatus: 'COMPLETE',
        rawTranscript: mod3Questions[i].resp,
        narrativeText: mod3Questions[i].resp,
        duration: 40 + Math.floor(Math.random() * 50),
        contextSource: 'module_2',
      },
    });
  }

  // Chapter for module 3 (not yet approved)
  await prisma.moduleChapter.create({
    data: {
      moduleId: mod3.id,
      content: `# School Days\n\nI remember the feeling of my mother's hand — warm and sure — as she walked me up to St. Margaret's School on my first day. The building loomed enormous, all red brick and tall windows. Sister Agnes stood at the door like a sentry, her habit perfectly pressed, her expression somewhere between welcome and warning.\n\nI cried when my mother left. I wasn't the only one. But by lunchtime, I had made my first real friend: a girl named Dorothy Callahan with red braids and a gap-toothed smile. We became inseparable that very day, and stayed that way through twelve years of school.\n\nThe nuns were strict — that goes without saying. A rap on the knuckles for talking out of turn, a stern look that could freeze you in your seat. Once I was sent to the principal's office for passing notes, and the terror of my mother finding out was worse than any punishment Sister could devise.\n\nBut there was joy, too. I loved English class, loved writing compositions and reading stories that took me far from Dorchester. History made the world feel bigger than our neighborhood. Mr. O'Brien, my eighth-grade teacher, was the first person outside my family who told me I was smart. He gave me books to read — real books, not the catechism — and encouraged me to ask questions, to wonder, to dream.\n\nDorothy and I walked to school together every morning, shared our lunches, whispered our secrets during recess. She was the keeper of all my childhood hopes and fears. When she married young and moved to New York, it felt like losing a limb. We wrote letters for years — long, honest letters that carried the weight of all those shared memories.\n\nSchool taught me many things, but the most important was this: that knowledge was a doorway, and once you walked through it, the world opened up in ways you never expected.`,
      wordCount: 305,
      version: 1,
      narrativePerson: 'first-person',
      narrativeTone: 'warm',
      narrativeStyle: 'descriptive',
    },
  });

  console.log('  Module 3 "School Days" — CHAPTER_GENERATED (awaiting approval)');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE 4: "Coming of Age" — QUESTIONS_GENERATED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const mod4 = await prisma.module.create({
    data: {
      projectId: project.id,
      moduleNumber: 4,
      title: 'Coming of Age',
      status: 'QUESTIONS_GENERATED',
      theme: 'Teenage years and growing up',
    },
  });

  const mod4Questions = [
    { q: 'What was it like being a teenager in your era?', cat: 'Teenage Life', resp: 'Being a teenager in the late 1950s was very different from today. We had more freedom in some ways — we could roam the neighborhood — but much less in others. Girls especially were expected to behave a certain way.' },
    { q: 'When did you first feel like an adult?', cat: 'Growing Up', resp: null },
    { q: 'What music or movies were important to you as a teenager?', cat: 'Culture', resp: null },
    { q: 'Tell me about your first job.', cat: 'Work', resp: null },
    { q: 'What were your dreams and aspirations?', cat: 'Dreams', resp: null },
    { q: 'How did you meet your life partner?', cat: 'Romance', resp: null },
  ];

  for (let i = 0; i < mod4Questions.length; i++) {
    const mq = mod4Questions[i];
    await prisma.moduleQuestion.create({
      data: {
        moduleId: mod4.id,
        question: mq.q,
        category: mq.cat,
        order: i + 1,
        response: mq.resp,
        respondedAt: mq.resp ? new Date('2026-02-28') : null,
        contextSource: 'module_3',
      },
    });
  }

  console.log('  Module 4 "Coming of Age" — QUESTIONS_GENERATED (1 typed answer)');

  console.log('\n' + '═'.repeat(60));
  console.log(`Done! Project ID: ${project.id}`);
  console.log(`Open: /projects/${project.id}/modules`);

  return project;
}

// Run directly from CLI
if (require.main === module) {
  seedMabelPipelineTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
