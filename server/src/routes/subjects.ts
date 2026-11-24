import { Router } from 'express'
import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import { prisma } from '../lib/prisma'
import { optionalAuth, requireAuth } from '../lib/auth'

const router = Router()

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many subject proposals submitted. Maximum 10 per hour allowed.' }
})

// GET /api/subjects - list and filter subjects
router.get('/', optionalAuth, async (req, res) => {
  const { search, dept, year, sem, type, sort = 'weighted', page = '1' } = req.query
  const take = 20
  const skip = (parseInt(page as string) - 1) * take

  const where: any = { status: 'approved' }

  if (dept) where.departments = { contains: dept as string }
  if (year) where.typicalYear = parseInt(year as string)
  if (sem) where.typicalSem = parseInt(sem as string)
  if (type) where.subjectType = type as string
  if (search) {
    const q = search as string
    where.OR = [
      { title: { contains: q } },
      { acronym: { contains: q } },
      { aliases: { contains: q } },
    ]
  }

  const orderBy: any = sort === 'brain_melt' ? { avgBrainMelt: 'desc' }
    : sort === 'survival' ? { avgSurvival: 'desc' }
    : sort === 'votes' ? { voteCount: 'desc' }
    : { weightedScore: 'desc' }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({ where, orderBy, take, skip }),
    prisma.subject.count({ where })
  ])

  res.json({ subjects, total, page: parseInt(page as string), pages: Math.ceil(total / take) })
})

// POST /api/subjects/submit - crowd-sourced subject submission (creates with status 'pending')
router.post('/submit', submitLimiter, requireAuth, async (req, res) => {
  const SubmitSchema = z.object({
    title: z.string().min(3).max(100),
    acronym: z.string().min(1).max(10),
    typicalYear: z.number().int().min(1).max(4),
    typicalSem: z.number().int().min(1).max(8),
    subjectType: z.enum(['Core', 'Lab', 'Elective']),
    departments: z.array(z.string()).min(1),
    censorRating: z.enum(['U', 'PG-13', 'R', 'NC-17']),
    tagline: z.string().max(200).optional(),
    aliases: z.array(z.string()).default([]),
  })

  const parsed = SubmitSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const data = parsed.data

  // Generate unique slug
  let baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!baseSlug) baseSlug = data.acronym.toLowerCase()
  let slug = baseSlug
  let counter = 1
  while (await prisma.subject.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const subject = await prisma.subject.create({
    data: {
      slug,
      acronym: data.acronym.toUpperCase(),
      title: data.title,
      aliases: JSON.stringify(data.aliases),
      departments: JSON.stringify(data.departments),
      typicalYear: data.typicalYear,
      typicalSem: data.typicalSem,
      subjectType: data.subjectType,
      censorRating: data.censorRating,
      tagline: data.tagline || null,
      status: 'pending',
    }
  })

  res.json({
    message: 'Subject proposed successfully! It has been placed in the Admin Review Queue.',
    subject: {
      ...subject,
      departments: JSON.parse(subject.departments),
      aliases: JSON.parse(subject.aliases),
    }
  })
})

// GET /api/subjects/:slug - detailed dossier + director's cut raw data
router.get('/:slug', optionalAuth, async (req, res) => {
  const slug = req.params.slug as string
  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      subjectRelations: { include: { relatedSubject: true } },
    }
  })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  // Fetch all ratings for histograms, top genres, and director's cut
  const allRatings = await prisma.rating.findMany({
    where: { subjectId: subject.id },
    include: { user: { select: { branch: true } } }
  })

  // Build 1-10 histogram
  const histogram: Record<number, number> = {}
  for (let i = 1; i <= 10; i++) histogram[i] = 0
  for (const r of allRatings) {
    if (r.overall >= 1 && r.overall <= 10) {
      histogram[r.overall] = (histogram[r.overall] || 0) + 1
    }
  }

  // Top genres from ratings
  const genreCount: Record<string, number> = {}
  for (const r of allRatings) {
    try {
      const genres: string[] = JSON.parse(r.genres)
      for (const g of genres) genreCount[g] = (genreCount[g] || 0) + 1
    } catch {
      // ignore parse err
    }
  }
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g)

  // User's rating if logged in
  const authUser = (req as any).user
  let userRating = null
  if (authUser) {
    userRating = await prisma.rating.findUnique({
      where: { userId_subjectId: { userId: authUser.userId, subjectId: subject.id } },
      include: { review: true }
    })
  }

  // Phase 3 Easter Egg: "Unrated Director's Cut" raw mathematical statistics
  const N = allRatings.length
  let scoreStddev = subject.scoreStddev || 0
  if (N > 0) {
    const mean = allRatings.reduce((sum, r) => sum + r.overall, 0) / N
    scoreStddev = parseFloat(Math.sqrt(allRatings.reduce((sum, r) => sum + Math.pow(r.overall - mean, 2), 0) / N).toFixed(2))
  }

  // Branch Breakdown
  const branchMap: Record<string, { total: number; count: number }> = {}
  allRatings.forEach(r => {
    const branch = r.user?.branch || 'General / Other'
    if (!branchMap[branch]) branchMap[branch] = { total: 0, count: 0 }
    branchMap[branch].total += r.overall
    branchMap[branch].count += 1
  })
  const branchBreakdown = Object.entries(branchMap).map(([branch, d]) => ({
    branch,
    avgScore: parseFloat((d.total / d.count).toFixed(2)),
    count: d.count,
  })).sort((a, b) => b.count - a.count)

  // Status Tag Breakdown (Casualty report)
  const statusTagCounts: Record<string, number> = {
    'Survived': 0,
    'Barely Escaped': 0,
    'Currently Suffering': 0,
    'Got a Backlog': 0,
    'Certified Topper': 0,
  }
  allRatings.forEach(r => {
    if (statusTagCounts[r.statusTag] !== undefined) {
      statusTagCounts[r.statusTag]++
    } else {
      statusTagCounts[r.statusTag] = 1
    }
  })

  const voteCounts = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: histogram[i + 1] || 0
  }))

  const directorsCut = {
    scoreStddev,
    variance: parseFloat((scoreStddev * scoreStddev).toFixed(2)),
    voteCounts,
    branchBreakdown,
    statusTagCounts,
    totalVotes: N,
  }

  res.json({
    subject: {
      ...subject,
      departments: JSON.parse(subject.departments),
      aliases: JSON.parse(subject.aliases)
    },
    histogram,
    topGenres,
    userRating,
    directorsCut,
    cinemaLinks: subject.subjectRelations.map((r: any) => ({
      id: r.relatedSubject.id,
      slug: r.relatedSubject.slug,
      title: r.relatedSubject.title,
      acronym: r.relatedSubject.acronym,
      relationTitle: r.relationTitle,
      relationNote: r.relationNote,
    }))
  })
})

export default router
