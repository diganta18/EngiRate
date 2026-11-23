import { CensorRating, SubjectType } from '../types'

export interface PosterTheme {
  background: string
  textColor: string
  accentColor: string
  censorLabel: string
  subtlePattern: string
  isLab: boolean
}

export const CENSOR_META: Record<CensorRating, { label: string; color: string; desc: string }> = {
  'U': {
    label: 'U: Pure Chill',
    color: '#15803D', // Forest Green
    desc: 'Passable with zero prep. Certified GPA Farmer.'
  },
  'PG-13': {
    label: 'PG-13: Minor Headache',
    color: '#78716C', // Warm Stone
    desc: 'One night of YouTube at 2x speed will save you.'
  },
  'R': {
    label: 'R: Mathematical Trauma',
    color: '#D97706', // Warm Amber
    desc: 'Unpredictable derivations and viva terror.'
  },
  'NC-17': {
    label: 'NC-17: Backlog Territory',
    color: '#B91C1C', // Muted Crimson
    desc: 'Extreme cognitive damage. Syllabus will fight back.'
  }
}

export function getPosterTheme(
  subjectType: SubjectType,
  censorRating: CensorRating,
  departments: string[] = []
): PosterTheme {
  const isLab = subjectType === 'Lab'
  const censor = CENSOR_META[censorRating] || CENSOR_META['PG-13']

  const background = isLab ? '#141413' : '#0A0A0A'
  const textColor = '#FAF8F5'
  const accentColor = censor.color

  // Primary department determine motif
  const primaryDept = departments[0] || 'Common 1st Year'
  let subtlePattern = 'cartesian'

  if (primaryDept.includes('CSE') || primaryDept.includes('IT')) {
    subtlePattern = 'binary'
  } else if (primaryDept.includes('ECE') || primaryDept.includes('EE')) {
    subtlePattern = 'waveform'
  } else if (primaryDept.includes('ME') || primaryDept.includes('Civil')) {
    subtlePattern = 'truss'
  }

  return {
    background,
    textColor,
    accentColor,
    censorLabel: censor.label,
    subtlePattern,
    isLab
  }
}
