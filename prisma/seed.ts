import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@mabel.com' },
    update: {},
    create: {
      email: 'demo@mabel.com',
      name: 'Sarah Mitchell',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      title: "Mom's Childhood Memories",
      status: 'NARRATIVE_COMPLETE',
      userId: user.id,
      interviewee: {
        create: {
          name: 'Margaret Wilson',
          relationship: 'mother',
          birthYear: 1952,
          generation: 'Boomer',
          topics: ['childhood', 'family', 'education'],
          notes: 'Grew up in small town, moved to city for college',
        },
      },
      narrative: {
        create: {
          content: 'Margaret\'s earliest memories were rooted in a small house on Maple Street...',
          structure: {
            chapters: [
              { title: 'Early Years', startPage: 1 },
              { title: 'Family Life', startPage: 5 },
            ],
          },
          status: 'FINAL',
          wordCount: 5420,
          version: 1,
        },
      },
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: "Dad's Military Service",
      status: 'COMPLETE',
      userId: user.id,
      interviewee: {
        create: {
          name: 'Robert Mitchell',
          relationship: 'father',
          birthYear: 1948,
          generation: 'Boomer',
          topics: ['military', 'vietnam', 'career'],
        },
      },
    },
  })

  const project3 = await prisma.project.create({
    data: {
      title: "Grandma's Immigration Story",
      status: 'DRAFT',
      userId: user.id,
      interviewee: {
        create: {
          name: 'Elena Rodriguez',
          relationship: 'grandmother',
          birthYear: 1935,
          generation: 'Silent Generation',
          topics: ['immigration', 'family', 'traditions'],
        },
      },
    },
  })

  const project4 = await prisma.project.create({
    data: {
      title: "Uncle John's Stories",
      status: 'TRANSCRIBING',
      userId: user.id,
      jobs: {
        create: {
          type: 'TRANSCRIBE_AUDIO',
          status: 'RUNNING',
          userId: user.id,
          progress: 65,
          input: {
            sessionId: 'sample-session-id',
            audioFileKey: 'audio/sample.mp3',
          },
        },
      },
    },
  })

  const project5 = await prisma.project.create({
    data: {
      title: 'Family Holiday Traditions',
      status: 'RECORDING_INFO',
      userId: user.id,
    },
  })

  console.log('✅ Created 5 sample projects')

  // Create sample interview questions for project 3
  const questions = [
    {
      projectId: project3.id,
      question: 'What do you remember most about your childhood home?',
      category: 'Early Life',
      order: 1,
    },
    {
      projectId: project3.id,
      question: 'Can you tell me about your decision to immigrate?',
      category: 'Immigration',
      order: 2,
    },
    {
      projectId: project3.id,
      question: 'What traditions did you bring with you from your homeland?',
      category: 'Traditions',
      order: 3,
    },
  ]

  await prisma.interviewQuestion.createMany({
    data: questions,
  })

  console.log('✅ Created sample interview questions')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
