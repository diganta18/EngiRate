import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎬 Seeding Phase 2 viral assets...')

  const admin = await prisma.user.findUnique({ where: { email: 'admin@engirate.app' } })
  const user = admin || (await prisma.user.findFirst())
  if (!user) {
    console.error('No user found to attach seeds to')
    return
  }

  // Get subjects
  const os = await prisma.subject.findUnique({ where: { slug: 'operating-systems' } })
  const m3 = await prisma.subject.findUnique({ where: { slug: 'engineering-mathematics-3' } })
  const dsa = await prisma.subject.findUnique({ where: { slug: 'data-structures-and-algorithms' } })
  const dbms = await prisma.subject.findUnique({ where: { slug: 'database-management-systems' } })
  const env = await prisma.subject.findUnique({ where: { slug: 'environmental-engineering' } })
  const flat = await prisma.subject.findUnique({ where: { slug: 'formal-language-automata-theory' } })
  const emft = await prisma.subject.findUnique({ where: { slug: 'electromagnetic-field-theory' } })
  const som = await prisma.subject.findUnique({ where: { slug: 'strength-of-materials' } })
  const se = await prisma.subject.findUnique({ where: { slug: 'software-engineering' } })
  const ai = await prisma.subject.findUnique({ where: { slug: 'artificial-intelligence' } })

  // 1. Seed Meme Credits
  const credits = [
    // OS
    { subjectId: os?.id, roleLabel: 'Starring', creditText: 'Random Indian YouTuber at 2x Speed', upvotes: 42 },
    { subjectId: os?.id, roleLabel: 'Supporting Cast', creditText: '3 AM Instant Coffee', upvotes: 28 },
    { subjectId: os?.id, roleLabel: 'Supporting Cast', creditText: 'Borrowed Lab Manual with Correction Fluid', upvotes: 19 },
    { subjectId: os?.id, roleLabel: 'Main Villain', creditText: '75% Attendance Criteria Sentinel', upvotes: 55 },
    { subjectId: os?.id, roleLabel: 'Plot Twist', creditText: 'Out-of-Syllabus 15-Mark LRU Proof', upvotes: 31 },

    // M3
    { subjectId: m3?.id, roleLabel: 'Starring', creditText: 'Gajendra Purohit YouTube Playlist', upvotes: 68 },
    { subjectId: m3?.id, roleLabel: 'Supporting Cast', creditText: 'Scientific Calculator fx-991ES Plus', upvotes: 34 },
    { subjectId: m3?.id, roleLabel: 'Main Villain', creditText: 'Fourier Transform Boundary Conditions', upvotes: 72 },
    { subjectId: m3?.id, roleLabel: 'Plot Twist', creditText: 'Formula Sheet Not Allowed in Hall', upvotes: 89 },

    // DSA
    { subjectId: dsa?.id, roleLabel: 'Starring', creditText: "Striver's SDE Sheet (A2Z)", upvotes: 51 },
    { subjectId: dsa?.id, roleLabel: 'Supporting Cast', creditText: 'Stack Overflow Thread from 2011', upvotes: 24 },
    { subjectId: dsa?.id, roleLabel: 'Main Villain', creditText: 'Dynamic Programming on Trees', upvotes: 60 },
    { subjectId: dsa?.id, roleLabel: 'Plot Twist', creditText: 'Recursion Depth Exceeded (Memory Limit)', upvotes: 44 },

    // DBMS
    { subjectId: dbms?.id, roleLabel: 'Starring', creditText: 'W3Schools SQL Sandbox', upvotes: 33 },
    { subjectId: dbms?.id, roleLabel: 'Main Villain', creditText: 'Lossless Decomposition Proof', upvotes: 41 },
  ]

  for (const c of credits) {
    if (!c.subjectId) continue
    await prisma.memeCredit.create({
      data: {
        subjectId: c.subjectId,
        userId: user.id,
        roleLabel: c.roleLabel,
        creditText: c.creditText,
        upvotes: c.upvotes,
      }
    })
  }
  console.log('✅ Seeded parody cast & crew credits')

  // 2. Seed Archetype votes
  const archetypes = [
    { subjectId: os?.id, archetypeKey: 'The "Read The Slides" Guy' },
    { subjectId: os?.id, archetypeKey: 'The "Attendance Is Mandatory" Sentinel' },
    { subjectId: m3?.id, archetypeKey: 'The "Out Of Syllabus" Architect' },
    { subjectId: m3?.id, archetypeKey: 'The "Viva Is A Conversation" Myth-Buster' },
    { subjectId: flat?.id, archetypeKey: 'The "Research Paper For Monday" Assigner' },
    { subjectId: env?.id, archetypeKey: 'The "Extra Credit For Breathing" Saint' },
  ]

  for (const a of archetypes) {
    if (!a.subjectId) continue
    await prisma.archetypeVote.upsert({
      where: { subjectId_userId_archetypeKey: { subjectId: a.subjectId, userId: user.id, archetypeKey: a.archetypeKey } },
      update: {},
      create: { subjectId: a.subjectId, userId: user.id, archetypeKey: a.archetypeKey }
    })
  }
  console.log('✅ Seeded classroom professor archetypes')

  // 3. Seed Watchlists
  if (se && env && ai) {
    await prisma.userList.upsert({
      where: { slug: 'safe-final-year-electives' },
      update: {},
      create: {
        userId: user.id,
        slug: 'safe-final-year-electives',
        title: 'Safe Final-Year Electives (GPA Protectors)',
        description: 'Subjects specifically engineered to protect your cumulative grade point average from catastrophic failure.',
        subjectIds: JSON.stringify([env.id, se.id, ai.id]),
        likesCount: 14,
      }
    })
  }

  if (m3 && flat && emft && som) {
    await prisma.userList.upsert({
      where: { slug: 'subjects-that-broke-me' },
      update: {},
      create: {
        userId: user.id,
        slug: 'subjects-that-broke-me',
        title: 'Subjects That Made Me Question My Degree',
        description: 'The psychological horror quadrology. Proceed only with 4 cups of filter coffee and zero expectations.',
        subjectIds: JSON.stringify([m3.id, flat.id, emft.id, som.id]),
        likesCount: 38,
      }
    })
  }
  console.log('✅ Seeded custom shareable watchlists')
  console.log('🎬 Phase 2 data seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
