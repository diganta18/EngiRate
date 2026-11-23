import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth, optionalAuth } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

export const ARCHETYPES = [
  'The "Read The Slides" Guy',
  'The "Attendance Is Mandatory" Sentinel',
  'The "Viva Is A Conversation" Myth-Buster',
  'The "Out Of Syllabus" Architect',
  'The "Extra Credit For Breathing" Saint',
  'The "Legacy Codebase" Maintainer',
  'The "Notes Only On WhatsApp" Rebel',
  'The "Research Paper For Monday" Assigner',
] as const

// GET /api/subjects/:subjectId/archetypes
router.get('/:subjectId/archetypes', optionalAuth, async (req, res) => {
  const subjectId = parseInt(req.params.subjectId as string, 10)
  const authUser = (req as any).user

  const votes = await prisma.archetypeVote.findMany({
    where: { subjectId }
  })

  // Count votes per archetype
  const counts: Record<string, number> = {}
  ARCHETYPES.forEach(a => counts[a] = 0)
  votes.forEach(v => {
    counts[v.archetypeKey] = (counts[v.archetypeKey] || 0) + 1
  })

  // User's votes
  let userVotes: string[] = []
  if (authUser) {
    userVotes = votes.filter(v => v.userId === authUser.userId).map(v => v.archetypeKey)
  }

  // Top 3 archetypes
  const topArchetypes = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => ({ key, count }))

  res.json({
    allArchetypes: ARCHETYPES,
    counts,
    topArchetypes,
    userVotes,
  })
})

// POST /api/subjects/:subjectId/archetypes - toggle archetype vote
router.post('/:subjectId/archetypes', requireAuth, async (req, res) => {
  const user = (req as any).user
  const subjectId = parseInt(req.params.subjectId as string, 10)
  const { archetypeKey } = z.object({ archetypeKey: z.enum(ARCHETYPES) }).parse(req.body)

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  // Check if user already voted for this archetype
  const existing = await prisma.archetypeVote.findUnique({
    where: { subjectId_userId_archetypeKey: { subjectId, userId: user.userId, archetypeKey } }
  })

  if (existing) {
    // Untoggle
    await prisma.archetypeVote.delete({ where: { id: existing.id } })
    return res.json({ toggled: false, archetypeKey })
  } else {
    // Check user vote count for this subject (max 2)
    const userVoteCount = await prisma.archetypeVote.count({
      where: { subjectId, userId: user.userId }
    })
    if (userVoteCount >= 2) {
      return res.status(400).json({ error: 'You can only vote for up to 2 professor archetypes per subject' })
    }

    await prisma.archetypeVote.create({
      data: { subjectId, userId: user.userId, archetypeKey }
    })
    return res.json({ toggled: true, archetypeKey })
  }
})

export default router
