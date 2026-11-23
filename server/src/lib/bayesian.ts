import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function recalculateSubjectStats(subjectId: number) {
  const ratings = await prisma.rating.findMany({ where: { subjectId } })
  const v = ratings.length

  if (v === 0) {
    await prisma.subject.update({
      where: { id: subjectId },
      data: { avgOverall: 0, avgSurvival: 0, avgBrainMelt: 0, avgValue: 0, weightedScore: 0, scoreStddev: 0, voteCount: 0 }
    })
    return
  }

  const allRatings = await prisma.rating.findMany({ select: { overall: true } })
  const C = allRatings.reduce((s, r) => s + r.overall, 0) / allRatings.length
  const m = 5

  const R = ratings.reduce((s, r) => s + r.overall, 0) / v
  const WR = (v / (v + m)) * R + (m / (v + m)) * C
  const stddev = Math.sqrt(ratings.reduce((s, r) => s + Math.pow(r.overall - R, 2), 0) / v)

  await prisma.subject.update({
    where: { id: subjectId },
    data: {
      avgOverall: parseFloat(R.toFixed(2)),
      avgSurvival: parseFloat((ratings.reduce((s, r) => s + r.survival, 0) / v).toFixed(2)),
      avgBrainMelt: parseFloat((ratings.reduce((s, r) => s + r.brainMelt, 0) / v).toFixed(2)),
      avgValue: parseFloat((ratings.reduce((s, r) => s + r.realValue, 0) / v).toFixed(2)),
      weightedScore: parseFloat(WR.toFixed(2)),
      scoreStddev: parseFloat(stddev.toFixed(2)),
      voteCount: v,
    }
  })
}
