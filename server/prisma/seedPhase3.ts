import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎬 Seeding Phase 3: 48-Hour Survival Resources & Pending Submissions...')

  const admin = await prisma.user.findUnique({ where: { email: 'admin@engirate.app' } })
  const critic = await prisma.user.findUnique({ where: { email: 'critic1@seed.com' } })
  const user = critic || admin || (await prisma.user.findFirst())

  if (!user) {
    console.error('No user found to attach seeds')
    return
  }

  // Fetch subjects
  const os = await prisma.subject.findUnique({ where: { slug: 'operating-systems' } })
  const m3 = await prisma.subject.findUnique({ where: { slug: 'engineering-mathematics-3' } })
  const dsa = await prisma.subject.findUnique({ where: { slug: 'data-structures-and-algorithms' } })
  const flat = await prisma.subject.findUnique({ where: { slug: 'formal-language-automata-theory' } })
  const dbms = await prisma.subject.findUnique({ where: { slug: 'database-management-systems' } })
  const bee = await prisma.subject.findUnique({ where: { slug: 'basic-electrical-engineering' } })

  const resources = [
    // OS
    {
      subjectId: os?.id,
      title: 'Gate Smashers — CPU Scheduling Algorithms in 1 Shot',
      url: 'https://youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
      resourceType: 'YouTube',
      upvotes: 89,
    },
    {
      subjectId: os?.id,
      title: 'Neso Academy — Memory Management, Paging & Segmentation',
      url: 'https://youtube.com/playlist?list=PLBlnK6fEyqRitWSE_AyyySWfhRvp8n7Qx',
      resourceType: 'CrashCourse',
      upvotes: 64,
    },
    {
      subjectId: os?.id,
      title: 'Operating Systems Handwritten Exam Revision Notes',
      url: 'https://github.com/torvalds/linux',
      resourceType: 'Notes',
      upvotes: 42,
    },
    {
      subjectId: os?.id,
      title: 'Solved Endsem PYQ Question Bank (2018–2024)',
      url: 'https://gateoverflow.in',
      resourceType: 'PYQ',
      upvotes: 55,
    },

    // M3
    {
      subjectId: m3?.id,
      title: 'Dr. Gajendra Purohit — Fourier Series & Transforms Marathon',
      url: 'https://youtube.com/c/DrGajendraPurohitGATE',
      resourceType: 'YouTube',
      upvotes: 142,
    },
    {
      subjectId: m3?.id,
      title: 'Laplace & Fourier Transforms 2-Page Formula Sheet',
      url: 'https://en.wikipedia.org/wiki/Fourier_transform',
      resourceType: 'Notes',
      upvotes: 98,
    },
    {
      subjectId: m3?.id,
      title: 'Partial Differential Equations in 90 Minutes',
      url: 'https://youtube.com/watch?v=exampleM3',
      resourceType: 'CrashCourse',
      upvotes: 76,
    },

    // DSA
    {
      subjectId: dsa?.id,
      title: "Striver's A2Z SDE Sheet — Dynamic Programming Decoded",
      url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
      resourceType: 'CrashCourse',
      upvotes: 130,
    },
    {
      subjectId: dsa?.id,
      title: 'Abdul Bari — Algorithms Masterclass (Greedy & Dynamic)',
      url: 'https://youtube.com/c/AbdulBari',
      resourceType: 'YouTube',
      upvotes: 115,
    },

    // FLAT / TOC
    {
      subjectId: flat?.id,
      title: 'Neso Academy — Theory of Computation & Automata Course',
      url: 'https://youtube.com/playlist?list=PLBlnK6fEyqRgp46KUv4ZY69yXmpwKOIev',
      resourceType: 'YouTube',
      upvotes: 110,
    },
    {
      subjectId: flat?.id,
      title: 'Pumping Lemma Step-by-Step Proof Guide (Zero Math Jargon)',
      url: 'https://en.wikipedia.org/wiki/Pumping_lemma',
      resourceType: 'Notes',
      upvotes: 87,
    },

    // DBMS
    {
      subjectId: dbms?.id,
      title: 'Knowledge Gate — Normalization 1NF to BCNF with Fast Tricks',
      url: 'https://youtube.com/c/KnowledgeGate_SanchitJain',
      resourceType: 'YouTube',
      upvotes: 95,
    },
    {
      subjectId: dbms?.id,
      title: 'SQL Transactions & ACID Properties 1-Pager',
      url: 'https://use-the-index-luke.com',
      resourceType: 'Notes',
      upvotes: 72,
    },

    // BEE
    {
      subjectId: bee?.id,
      title: 'Neso Academy — Basic Electrical Engineering Concepts in 3 Hours',
      url: 'https://youtube.com/playlist?list=PLBlnK6fEyqRgPqV8kPzN8v_V329K3QZfS',
      resourceType: 'YouTube',
      upvotes: 68,
    },
  ]

  for (const r of resources) {
    if (!r.subjectId) continue
    await prisma.studyResource.create({
      data: {
        subjectId: r.subjectId,
        userId: user.id,
        title: r.title,
        url: r.url,
        resourceType: r.resourceType,
        upvotes: r.upvotes,
      }
    })
  }
  console.log(`✅ Seeded ${resources.length} emergency 48-Hour Survival resources`)

  // Seed 2 Pending Submissions for the Admin Queue
  const pendingSubjects = [
    {
      slug: 'cloud-computing-and-devops',
      acronym: 'CCDO',
      title: 'Cloud Computing & DevOps',
      aliases: JSON.stringify(['Cloud', 'DevOps', 'AWS Class']),
      departments: JSON.stringify(['CSE', 'IT']),
      typicalYear: 4,
      typicalSem: 7,
      subjectType: 'Elective',
      censorRating: 'PG-13',
      tagline: 'Spending 3 hours debugging YAML indentation while AWS charges you $42.',
      status: 'pending',
    },
    {
      slug: 'vlsi-system-design',
      acronym: 'VLSI',
      title: 'VLSI System Design',
      aliases: JSON.stringify(['VLSI', 'Verilog', 'Chip Design']),
      departments: JSON.stringify(['ECE', 'EE']),
      typicalYear: 3,
      typicalSem: 6,
      subjectType: 'Core',
      censorRating: 'R',
      tagline: 'When a single floating gate causes an existential crisis.',
      status: 'pending',
    },
  ]

  for (const ps of pendingSubjects) {
    await prisma.subject.upsert({
      where: { slug: ps.slug },
      update: {},
      create: ps,
    })
  }
  console.log(`✅ Seeded ${pendingSubjects.length} pending subject submissions for admin queue`)
  console.log('🎬 Phase 3 data seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
