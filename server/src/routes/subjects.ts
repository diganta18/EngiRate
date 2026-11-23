import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { optionalAuth } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

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

router.get('/:slug', optionalAuth, async (req, res) => {
  const slug = req.params.slug as string
  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      ratings: { select: { overall: true } },
      subjectRelations: { include: { relatedSubject: true } },
    }
  })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  // Build histogram
  const histogram: Record<number, number> = {}
  for (let i = 1; i <= 10; i++) histogram[i] = 0
  for (const r of subject.ratings) histogram[r.overall]++

  // Top genres from ratings
  const genreCount: Record<string, number> = {}
  const allRatings = await prisma.rating.findMany({ where: { subjectId: subject.id }, select: { genres: true } })
  for (const r of allRatings) {
    const genres: string[] = JSON.parse(r.genres)
    for (const g of genres) genreCount[g] = (genreCount[g] || 0) + 1
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

  const { ratings, ...subjectData } = subject
  res.json({
    subject: { ...subjectData, departments: JSON.parse(subjectData.departments), aliases: JSON.parse(subjectData.aliases) },
    histogram,
    topGenres,
    userRating,
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
