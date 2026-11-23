import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

const subjects = [
  // Common 1st Year
  {
    slug: 'engineering-mathematics-1',
    acronym: 'M1',
    title: 'Engineering Mathematics I',
    aliases: JSON.stringify(['M1', 'Maths 1', 'Engg Math 1']),
    departments: JSON.stringify(['Common 1st Year']),
    typicalYear: 1,
    typicalSem: 1,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'The warm-up act nobody asked for. Calculus with a smile.',
  },
  {
    slug: 'engineering-mathematics-2',
    acronym: 'M2',
    title: 'Engineering Mathematics II',
    aliases: JSON.stringify(['M2', 'Maths 2', 'Engg Math 2']),
    departments: JSON.stringify(['Common 1st Year']),
    typicalYear: 1,
    typicalSem: 2,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'M1 graduated. M2 showed up with Laplace transforms and a grudge.',
  },
  {
    slug: 'engineering-mathematics-3',
    acronym: 'M3',
    title: 'Engineering Mathematics III',
    aliases: JSON.stringify(['M3', 'Maths 3', 'M-III', 'The Trauma']),
    departments: JSON.stringify(['Common 1st Year', 'CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil']),
    typicalYear: 2,
    typicalSem: 3,
    subjectType: 'Core',
    censorRating: 'NC-17',
    tagline: 'In space, no one can hear you fail a viva.',
  },
  {
    slug: 'engineering-mechanics',
    acronym: 'EM',
    title: 'Engineering Mechanics',
    aliases: JSON.stringify(['EM', 'Engg Mech', 'Statics & Dynamics']),
    departments: JSON.stringify(['Common 1st Year', 'ME', 'Civil']),
    typicalYear: 1,
    typicalSem: 1,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: "Newton's revenge. Every body continues to suffer unless acted upon.",
  },
  {
    slug: 'basic-electrical-engineering',
    acronym: 'BEE',
    title: 'Basic Electrical Engineering',
    aliases: JSON.stringify(['BEE', 'BEE Lab', 'Circuits 101']),
    departments: JSON.stringify(['Common 1st Year']),
    typicalYear: 1,
    typicalSem: 2,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: "Ohm's Law: the only three words you'll remember six months later.",
  },
  {
    slug: 'engineering-drawing',
    acronym: 'ED',
    title: 'Engineering Drawing / Graphics',
    aliases: JSON.stringify(['ED', 'EG', 'Engg Drawing', 'AutoCAD Class']),
    departments: JSON.stringify(['Common 1st Year']),
    typicalYear: 1,
    typicalSem: 1,
    subjectType: 'Core',
    censorRating: 'U',
    tagline: "The last time you'll touch a compass. Cherish it.",
  },
  {
    slug: 'programming-for-problem-solving',
    acronym: 'C',
    title: 'Programming for Problem Solving',
    aliases: JSON.stringify(['C', 'PPS', 'C Language', 'C Prog']),
    departments: JSON.stringify(['Common 1st Year']),
    typicalYear: 1,
    typicalSem: 1,
    subjectType: 'Core',
    censorRating: 'U',
    tagline: 'Hello, World. And hello to 4 years of debugging at 2 AM.',
  },
  // CSE / IT
  {
    slug: 'data-structures-and-algorithms',
    acronym: 'DSA',
    title: 'Data Structures & Algorithms',
    aliases: JSON.stringify(['DSA', 'DS', 'Data Structures', 'Algo']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 2,
    typicalSem: 3,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: "Your interviewer's favourite weapon. Best learn it before they do.",
  },
  {
    slug: 'discrete-mathematics',
    acronym: 'DM',
    title: 'Discrete Mathematics',
    aliases: JSON.stringify(['DM', 'Discrete Maths', 'Graph Theory']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 2,
    typicalSem: 3,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'Graph theory, sets, and the slow erosion of your confidence.',
  },
  {
    slug: 'computer-organization-and-architecture',
    acronym: 'COA',
    title: 'Computer Organization & Architecture',
    aliases: JSON.stringify(['COA', 'CA', 'Computer Arch', 'CO&A']),
    departments: JSON.stringify(['CSE', 'IT', 'ECE']),
    typicalYear: 2,
    typicalSem: 4,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: "You'll understand how computers work. You will not understand why you need to know this.",
  },
  {
    slug: 'operating-systems',
    acronym: 'OS',
    title: 'Operating Systems',
    aliases: JSON.stringify(['OS', 'OpSys', 'Operating System']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: "Deadlocks, starvation, and scheduling. It's basically corporate life.",
  },
  {
    slug: 'database-management-systems',
    acronym: 'DBMS',
    title: 'Database Management Systems',
    aliases: JSON.stringify(['DBMS', 'DB', 'Database', 'SQL Class']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'SELECT * FROM knowledge WHERE retained > 0; — 0 rows returned.',
  },
  {
    slug: 'formal-language-automata-theory',
    acronym: 'FLAT',
    title: 'Formal Language & Automata Theory',
    aliases: JSON.stringify(['FLAT', 'TOC', 'Theory of Computation', 'Automata']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'NC-17',
    tagline: 'A subject so theoretical it loops back and rejects itself.',
  },
  {
    slug: 'compiler-design',
    acronym: 'CD',
    title: 'Compiler Design',
    aliases: JSON.stringify(['CD', 'Compilers', 'Compiler Construction']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 4,
    typicalSem: 7,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'You will build a compiler. It will not compile. The irony is the lesson.',
  },
  {
    slug: 'computer-networks',
    acronym: 'CN',
    title: 'Computer Networks',
    aliases: JSON.stringify(['CN', 'Networks', 'Networking', 'CN Lab']),
    departments: JSON.stringify(['CSE', 'IT', 'ECE']),
    typicalYear: 3,
    typicalSem: 6,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: "The OSI model: 7 layers of things you'll memorize and immediately forget.",
  },
  {
    slug: 'software-engineering',
    acronym: 'SE',
    title: 'Software Engineering',
    aliases: JSON.stringify(['SE', 'Soft Engg', 'SWE']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 3,
    typicalSem: 6,
    subjectType: 'Core',
    censorRating: 'U',
    tagline: 'Waterfall, Agile, Scrum. The irony of a 100-page report on project management.',
  },
  {
    slug: 'artificial-intelligence',
    acronym: 'AI',
    title: 'Artificial Intelligence',
    aliases: JSON.stringify(['AI', 'Artificial Intelligence', 'AI Lab']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 4,
    typicalSem: 7,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'A* search, minimax, and the dawning realization you are the artificial intelligence.',
  },
  {
    slug: 'machine-learning',
    acronym: 'ML',
    title: 'Machine Learning',
    aliases: JSON.stringify(['ML', 'Machine Learning', 'ML Lab']),
    departments: JSON.stringify(['CSE', 'IT']),
    typicalYear: 4,
    typicalSem: 7,
    subjectType: 'Elective',
    censorRating: 'PG-13',
    tagline: 'Linear regression to neural nets. Gradient descent into madness.',
  },
  // ECE / EE
  {
    slug: 'digital-electronics',
    acronym: 'DE',
    title: 'Digital Electronics',
    aliases: JSON.stringify(['DE', 'Digital Circuits', 'DE Lab']),
    departments: JSON.stringify(['ECE', 'EE', 'CSE']),
    typicalYear: 2,
    typicalSem: 3,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'Logic gates, flip-flops, and the existential dread of a Karnaugh map.',
  },
  {
    slug: 'analog-electronic-circuits',
    acronym: 'AEC',
    title: 'Analog Electronic Circuits',
    aliases: JSON.stringify(['AEC', 'Analog Circuits', 'EC Lab']),
    departments: JSON.stringify(['ECE', 'EE']),
    typicalYear: 2,
    typicalSem: 4,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: "Transistors. Op-Amps. The quiet dignity of a circuit that doesn't oscillate.",
  },
  {
    slug: 'signals-and-systems',
    acronym: 'SS',
    title: 'Signals & Systems',
    aliases: JSON.stringify(['S&S', 'SS', 'Signals', 'SigSys']),
    departments: JSON.stringify(['ECE', 'EE']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'Fourier transforms: when M3 and ECE had a child and nobody was happy about it.',
  },
  {
    slug: 'electromagnetic-field-theory',
    acronym: 'EMFT',
    title: 'Electromagnetic Field Theory',
    aliases: JSON.stringify(['EMFT', 'EMF', 'EM Theory', 'Maxwell']),
    departments: JSON.stringify(['ECE', 'EE']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'NC-17',
    tagline: "Maxwell's equations: four lines of math that explain the entire universe, unfortunately.",
  },
  {
    slug: 'microprocessors-and-microcontrollers',
    acronym: 'MPMC',
    title: 'Microprocessors & Microcontrollers',
    aliases: JSON.stringify(['MPMC', '8085', 'Microcontrollers', 'MP Lab']),
    departments: JSON.stringify(['ECE', 'EE', 'CSE']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'Assembly language: the original no-code solution, except it is all code.',
  },
  {
    slug: 'control-systems',
    acronym: 'CS',
    title: 'Control Systems',
    aliases: JSON.stringify(['CS', 'Control Systems', 'Bode Plot Hell']),
    departments: JSON.stringify(['ECE', 'EE', 'ME']),
    typicalYear: 3,
    typicalSem: 6,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'The Bode plot: a graph so complex it controls you.',
  },
  {
    slug: 'power-systems',
    acronym: 'PS',
    title: 'Power Systems',
    aliases: JSON.stringify(['PS', 'Power Systems', 'Power Engg']),
    departments: JSON.stringify(['EE']),
    typicalYear: 3,
    typicalSem: 6,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: 'The subject that powers civilization. Your GPA, less so.',
  },
  // ME / Civil
  {
    slug: 'engineering-thermodynamics',
    acronym: 'Thermo',
    title: 'Engineering Thermodynamics',
    aliases: JSON.stringify(['Thermo', 'TD', 'Thermodynamics', 'Heat']),
    departments: JSON.stringify(['ME', 'Civil']),
    typicalYear: 2,
    typicalSem: 3,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'The laws of thermodynamics: entropy always increases, including in your notes.',
  },
  {
    slug: 'fluid-mechanics',
    acronym: 'FM',
    title: 'Fluid Mechanics',
    aliases: JSON.stringify(['FM', 'Fluid Mech', 'Fluids']),
    departments: JSON.stringify(['ME', 'Civil']),
    typicalYear: 2,
    typicalSem: 4,
    subjectType: 'Core',
    censorRating: 'PG-13',
    tagline: "Bernoulli's principle: lift. Reynolds number: confusion.",
  },
  {
    slug: 'strength-of-materials',
    acronym: 'SOM',
    title: 'Strength of Materials',
    aliases: JSON.stringify(['SOM', 'MOS', 'Mechanics of Solids']),
    departments: JSON.stringify(['ME', 'Civil']),
    typicalYear: 2,
    typicalSem: 3,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'Testing the limits of steel. And your soul.',
  },
  {
    slug: 'heat-and-mass-transfer',
    acronym: 'HMT',
    title: 'Heat & Mass Transfer',
    aliases: JSON.stringify(['HMT', 'Heat Transfer', 'H&MT']),
    departments: JSON.stringify(['ME']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'Where thermodynamics meets fluid mechanics and the exam gets worse.',
  },
  {
    slug: 'structural-analysis',
    acronym: 'SA',
    title: 'Structural Analysis',
    aliases: JSON.stringify(['SA', 'Structural', 'Struct Analysis']),
    departments: JSON.stringify(['Civil']),
    typicalYear: 3,
    typicalSem: 5,
    subjectType: 'Core',
    censorRating: 'R',
    tagline: 'The subject that determines if bridges stand. Your confidence does not.',
  },
  {
    slug: 'environmental-engineering',
    acronym: 'EE',
    title: 'Environmental Engineering',
    aliases: JSON.stringify(['EnvE', 'Environmental Engg', 'EE Civil']),
    departments: JSON.stringify(['Civil']),
    typicalYear: 3,
    typicalSem: 6,
    subjectType: 'Core',
    censorRating: 'U',
    tagline: "The GPA farmer's paradise. Save the planet, save your CGPA.",
  },
]

const starterReviews = [
  {
    subjectSlug: 'operating-systems',
    headline: 'Peak Fiction',
    body: 'Professor said "this is very practical for industry." I am now a backend engineer. I have never manually implemented a page replacement algorithm. The LRU discussion hit different at 3 AM though.',
    statusTag: 'Survived',
    genres: ['Pure Fiction', 'Psychological Horror'],
    overall: 7, survival: 5, brainMelt: 7, realValue: 6
  },
  {
    subjectSlug: 'operating-systems',
    headline: 'Deadlock: A Love Story',
    body: 'Thread A is waiting for Thread B. Thread B is waiting for Thread A. I am waiting for my results. Nobody moves. This is the most relatable subject in the entire degree.',
    statusTag: 'Barely Escaped',
    genres: ['Psychological Horror', 'Slow Burn'],
    overall: 8, survival: 4, brainMelt: 8, realValue: 7
  },
  {
    subjectSlug: 'database-management-systems',
    headline: 'Normalized My Expectations',
    body: 'Third Normal Form. My life is not in Third Normal Form. My study notes are not in First Normal Form. But I can write a JOIN query now, which is frankly more than most of my project partners can say.',
    statusTag: 'Survived',
    genres: ['Sleeper Hit', 'Certified GPA Farmer'],
    overall: 7, survival: 7, brainMelt: 5, realValue: 8
  },
  {
    subjectSlug: 'engineering-mathematics-3',
    headline: 'Sent Back',
    body: 'Failed once. Wrote it again. Partial differential equations do not care about your feelings, your branch, or your career aspirations. They simply exist to test whether you are still alive.',
    statusTag: 'Got a Backlog',
    genres: ['Psychological Horror', 'Pure Fiction'],
    overall: 2, survival: 1, brainMelt: 10, realValue: 2
  },
  {
    subjectSlug: 'formal-language-automata-theory',
    headline: 'The Machine Rejects You',
    body: 'PDA, NFA, DFA, TM. Turing proved some problems are undecidable. After this subject, I proved my understanding of this subject is also undecidable.',
    statusTag: 'Barely Escaped',
    genres: ['Psychological Horror', 'Pure Fiction'],
    overall: 3, survival: 2, brainMelt: 9, realValue: 3
  },
  {
    subjectSlug: 'data-structures-and-algorithms',
    headline: 'The Prerequisite To Everything',
    body: 'Hated it in sem 3. Got a Leetcode problem in my Google interview in sem 7. Came back to leave this review as a warning and also a gratitude note. It is complicated.',
    statusTag: 'Survived',
    genres: ['Action-Thriller', 'Plot Twist Exam'],
    overall: 8, survival: 5, brainMelt: 7, realValue: 10
  },
  {
    subjectSlug: 'software-engineering',
    headline: 'The Yap Subject',
    body: 'Wrote a 60-page SRS document for a ToDo app. The ToDo app was never built. The SRS document is still the longest thing I have ever written. This is what a philosophy degree in engineering looks like.',
    statusTag: 'Survived',
    genres: ['Filler Episode', 'Certified GPA Farmer'],
    overall: 6, survival: 9, brainMelt: 2, realValue: 3
  },
  {
    subjectSlug: 'electromagnetic-field-theory',
    headline: 'Maxwell Wins',
    body: 'Four equations. Infinite suffering. I read that Maxwell wrote these equations while also running a farm, managing a family, and doing other physics. I cannot manage four equations. I respect the man.',
    statusTag: 'Got a Backlog',
    genres: ['Psychological Horror', 'Pure Fiction'],
    overall: 2, survival: 2, brainMelt: 10, realValue: 4
  },
  {
    subjectSlug: 'engineering-drawing',
    headline: 'The Last Analog Subject',
    body: 'Drew projection views with a compass and a ruler like it was 1952. Got full marks. This is the only subject where my handwriting was an asset. I miss it.',
    statusTag: 'Certified Topper',
    genres: ['Sleeper Hit', 'Certified GPA Farmer'],
    overall: 8, survival: 9, brainMelt: 2, realValue: 5
  },
  {
    subjectSlug: 'environmental-engineering',
    headline: 'The Chosen Subject',
    body: 'BOD. COD. Sewage treatment. I do not know what any of this has to do with civil engineering but I got a 9/10 and left. Certified GPA farmer. No notes required. Just attend and nod.',
    statusTag: 'Certified Topper',
    genres: ['Certified GPA Farmer', 'Filler Episode'],
    overall: 9, survival: 10, brainMelt: 1, realValue: 4
  }
]

const subjectRelations = [
  { from: 'operating-systems', to: 'database-management-systems', title: 'The Concurrency Crossover', note: 'Locks, deadlocks, transactions — same villain, different stage' },
  { from: 'operating-systems', to: 'computer-networks', title: 'The Network Stack Sequel', note: 'Sockets, protocols, and more buffering than your Netflix connection' },
  { from: 'operating-systems', to: 'computer-organization-and-architecture', title: 'The Origin Story', note: 'COA built the hardware OS runs on. Consider it the prequel.' },
  { from: 'data-structures-and-algorithms', to: 'formal-language-automata-theory', title: 'The Theory Crossover', note: 'Graph traversal and automata share the same DNA' },
  { from: 'data-structures-and-algorithms', to: 'database-management-systems', title: 'B-Trees: The Reunion', note: 'You learned BSTs in DSA. DBMS uses them. Full circle.' },
  { from: 'engineering-mathematics-3', to: 'signals-and-systems', title: 'The Transform Extended Universe', note: 'Fourier and Laplace show up again. You have been warned.' },
  { from: 'engineering-mathematics-3', to: 'electromagnetic-field-theory', title: 'The Mathematical Horror Sequel', note: "PDE from M3 returns as Maxwell's equations. Same nightmare." },
  { from: 'computer-organization-and-architecture', to: 'operating-systems', title: 'From Silicon to Scheduler', note: 'COA is the hardware. OS is the software. Inevitable crossover.' },
  { from: 'analog-electronic-circuits', to: 'signals-and-systems', title: 'The Signal Origin', note: 'You build the circuits in AEC that generate the signals in S&S.' },
  { from: 'compiler-design', to: 'formal-language-automata-theory', title: 'Theory Meets Implementation', note: 'FLAT gives you DFAs. CD makes you use them on actual code.' },
]

async function main() {
  console.log('🎬 Starting EngiRate seed...')

  // Create admin user
  const adminHash = await argon2.hash('admin123')
  await prisma.user.upsert({
    where: { email: 'admin@engirate.app' },
    update: {},
    create: {
      username: 'EngiRate_Admin',
      email: 'admin@engirate.app',
      passwordHash: adminHash,
      role: 'admin',
      bio: "The official EngiRate editorial board. We rate subjects so you don't have to suffer alone.",
    }
  })

  // Create seed users for reviews
  const seedUsers = []
  const seedUserData = [
    { username: 'nightbefore_critic', email: 'critic1@seed.com', branch: 'CSE', gradYear: 2025, bio: 'Opens the syllabus at 11 PM. Every semester. Without fail.' },
    { username: 'cgpa_archaeologist', email: 'critic2@seed.com', branch: 'ECE', gradYear: 2024, bio: 'Excavating GPA ruins since 2020.' },
    { username: 'backlog_phoenix', email: 'critic3@seed.com', branch: 'ME', gradYear: 2026, bio: 'Twice burned by M3. Still here.' },
    { username: 'certified_topper', email: 'critic4@seed.com', branch: 'Civil', gradYear: 2025, bio: 'Toppers have feelings too.' },
    { username: 'chaos_agent_x', email: 'critic5@seed.com', branch: 'IT', gradYear: 2024, bio: 'Rates 10 and 1. No in between.' },
  ]

  for (const userData of seedUserData) {
    const hash = await argon2.hash('seed1234')
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, passwordHash: hash }
    })
    seedUsers.push(user)
  }

  // Seed all subjects
  const subjectMap: Record<string, number> = {}
  for (const s of subjects) {
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {},
      create: s
    })
    subjectMap[s.slug] = subject.id
  }
  console.log(`✅ Seeded ${subjects.length} subjects`)

  // Seed starter reviews
  for (let i = 0; i < starterReviews.length; i++) {
    const r = starterReviews[i]
    const subjectId = subjectMap[r.subjectSlug]
    const userId = seedUsers[i % seedUsers.length].id

    if (!subjectId) continue

    const rating = await prisma.rating.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      update: {},
      create: {
        userId,
        subjectId,
        overall: r.overall,
        survival: r.survival,
        brainMelt: r.brainMelt,
        realValue: r.realValue,
        genres: JSON.stringify(r.genres),
        statusTag: r.statusTag,
      }
    })

    const existing = await prisma.review.findUnique({ where: { ratingId: rating.id } })
    if (!existing) {
      await prisma.review.create({
        data: {
          ratingId: rating.id,
          userId,
          subjectId,
          headline: r.headline,
          body: r.body,
        }
      })
    }
  }
  console.log(`✅ Seeded ${starterReviews.length} starter reviews`)

  // Recalculate stats
  const subjectsWithRatings = await prisma.subject.findMany({ include: { ratings: true } })
  const allRatings = await prisma.rating.findMany()
  const C = allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r.overall, 0) / allRatings.length : 5
  const m = 5

  for (const subject of subjectsWithRatings) {
    if (subject.ratings.length === 0) continue
    const v = subject.ratings.length
    const R = subject.ratings.reduce((s, r) => s + r.overall, 0) / v
    const WR = (v / (v + m)) * R + (m / (v + m)) * C
    const stddev = Math.sqrt(subject.ratings.reduce((s, r) => s + Math.pow(r.overall - R, 2), 0) / v)

    await prisma.subject.update({
      where: { id: subject.id },
      data: {
        avgOverall: parseFloat(R.toFixed(2)),
        avgSurvival: parseFloat((subject.ratings.reduce((s, r) => s + r.survival, 0) / v).toFixed(2)),
        avgBrainMelt: parseFloat((subject.ratings.reduce((s, r) => s + r.brainMelt, 0) / v).toFixed(2)),
        avgValue: parseFloat((subject.ratings.reduce((s, r) => s + r.realValue, 0) / v).toFixed(2)),
        weightedScore: parseFloat(WR.toFixed(2)),
        scoreStddev: parseFloat(stddev.toFixed(2)),
        voteCount: v,
      }
    })
  }
  console.log('✅ Recalculated Bayesian scores')

  // Seed subject relations
  for (const rel of subjectRelations) {
    const fromId = subjectMap[rel.from]
    const toId = subjectMap[rel.to]
    if (!fromId || !toId) continue
    await prisma.subjectRelation.upsert({
      where: { subjectId_relatedSubjectId: { subjectId: fromId, relatedSubjectId: toId } },
      update: {},
      create: { subjectId: fromId, relatedSubjectId: toId, relationTitle: rel.title, relationNote: rel.note }
    })
  }
  console.log(`✅ Seeded ${subjectRelations.length} cinematic universe links`)

  console.log('🎬 EngiRate seed complete! The show begins.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
