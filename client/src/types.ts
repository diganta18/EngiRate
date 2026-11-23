export type SubjectType = 'Core' | 'Lab' | 'Elective'
export type CensorRating = 'U' | 'PG-13' | 'R' | 'NC-17'
export type StatusTag = 'Survived' | 'Barely Escaped' | 'Currently Suffering' | 'Got a Backlog' | 'Certified Topper'
export type ReactionType = 'felt_this' | 'trauma' | 'cap'

export interface Subject {
  id: number
  slug: string
  acronym: string
  title: string
  aliases: string[]
  departments: string[]
  typicalYear: number
  typicalSem: number
  subjectType: SubjectType
  censorRating: CensorRating
  tagline: string | null
  avgOverall: number
  avgSurvival: number
  avgBrainMelt: number
  avgValue: number
  weightedScore: number
  scoreStddev: number
  voteCount: number
  status: 'approved' | 'pending'
  createdAt: string
}

export interface Rating {
  id: number
  userId: number
  subjectId: number
  overall: number
  survival: number
  brainMelt: number
  realValue: number
  genres: string[]
  statusTag: StatusTag
  createdAt: string
  updatedAt?: string
  subject?: Subject
  review?: Review | null
}

export interface Review {
  id: number
  ratingId: number
  userId: number
  subjectId: number
  headline: string | null
  body: string
  feltThisCount: number
  traumaCount: number
  capCount: number
  isHidden: boolean
  createdAt: string
  user: {
    id: number
    username: string
    branch?: string | null
    gradYear?: number | null
  }
  rating?: {
    overall: number
    survival: number
    brainMelt: number
    realValue: number
    genres: string[]
    statusTag: StatusTag
  }
  userReaction?: ReactionType | null
  _count?: {
    comments: number
  }
}

export interface Comment {
  id: number
  reviewId: number
  userId: number
  body: string
  createdAt: string
  user: {
    id: number
    username: string
  }
}

export interface Certificate {
  certNo: string
  username: string
  subjectTitle: string
  censorRating?: CensorRating
  statusTag: StatusTag
  overall: number
  survival?: number
  brainMelt?: number
  realValue?: number
  issuedAt: string
}

export interface UserProfile {
  id: number
  username: string
  branch: string | null
  gradYear: number | null
  bio: string | null
  createdAt: string
  criticPersona: string
  topFour: Subject[]
  ratingCount: number
}

export interface CinemaLink {
  id: number
  slug: string
  title: string
  acronym: string
  relationTitle: string
  relationNote: string
}

export interface SubjectDetailResponse {
  subject: Subject
  histogram: Record<number, number>
  topGenres: string[]
  userRating: Rating | null
  cinemaLinks: CinemaLink[]
}

export interface AuthUser {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
  branch?: string | null
  gradYear?: number | null
  bio?: string | null
  topFourIds?: number[]
}
