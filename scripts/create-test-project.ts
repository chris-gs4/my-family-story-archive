import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmklhqepl000012kiarrvtl2n' // Your user ID

  // Create project
  const project = await prisma.project.create({
    data: {
      title: 'Test Project - API Testing',
      userId: userId,
      status: 'DRAFT',
      currentModuleNumber: 1,
      totalModulesCompleted: 0,
    },
  })

  console.log('✅ Project created:', project.id)

  // Create interviewee
  const interviewee = await prisma.interviewee.create({
    data: {
      projectId: project.id,
      name: 'Jane Smith',
      relationship: 'mother',
      birthYear: 1955,
      generation: 'Baby Boomer',
      topics: ['childhood', 'family', 'career'],
    },
  })

  console.log('✅ Interviewee created:', interviewee.id)
  console.log('\n🎯 Use this project ID for testing:', project.id)
  console.log('\nRun this in browser console:')
  console.log(`const projectId = '${project.id}';`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
