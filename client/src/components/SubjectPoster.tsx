import React from 'react'
import { CensorRating, SubjectType } from '../types'
import { getPosterTheme } from '../lib/posterTheme'

interface SubjectPosterProps {
  acronym: string
  title: string
  subjectType: SubjectType
  censorRating: CensorRating
  departments: string[]
  typicalSem: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const SubjectPoster: React.FC<SubjectPosterProps> = ({
  acronym,
  title,
  subjectType,
  censorRating,
  departments = [],
  typicalSem,
  size = 'md',
  className = ''
}) => {
  const theme = getPosterTheme(subjectType, censorRating, departments)

  // Size styling maps (maintaining strict 2:3 aspect ratio)
  const sizeClasses = {
    sm: 'w-[110px] h-[165px] text-[10px]',
    md: 'w-[160px] h-[240px] text-xs',
    lg: 'w-[240px] h-[360px] sm:w-[280px] sm:h-[420px] text-sm',
  }

  const acronymSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl sm:text-7xl',
  }

  const renderMotif = () => {
    switch (theme.subtlePattern) {
      case 'binary':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="binary-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <text x="2" y="10" fill="#FAF8F5" fontSize="8" fontFamily="monospace">01</text>
                <text x="14" y="20" fill="#FAF8F5" fontSize="8" fontFamily="monospace">10</text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#binary-grid)" />
          </svg>
        )
      case 'waveform':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,30 Q 30,10 60,30 T 120,30 T 180,30 T 240,30" fill="none" stroke="#FAF8F5" strokeWidth="1" />
            <path d="M 0,80 Q 40,50 80,80 T 160,80 T 240,80" fill="none" stroke="#FAF8F5" strokeWidth="0.8" opacity="0.5" />
            <path d="M 0,140 Q 25,120 50,140 T 100,140 T 150,140 T 200,140" fill="none" stroke="#FAF8F5" strokeWidth="0.8" opacity="0.6" />
          </svg>
        )
      case 'truss':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#FAF8F5" strokeWidth="0.75" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#FAF8F5" strokeWidth="0.75" />
            <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#FAF8F5" strokeWidth="0.75" />
          </svg>
        )
      default: // Cartesian / Common
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cart-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#FAF8F5" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cart-grid)" />
          </svg>
        )
    }
  }

  return (
    <div
      className={`relative select-none flex flex-col justify-between p-3.5 sm:p-5 rounded-sm shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-neutral-800 shrink-0 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: theme.background,
        color: theme.textColor,
      }}
      aria-label={`${title} (${acronym}) - Poster. Rated ${censorRating}`}
    >
      {/* Background Subtle Motif */}
      {renderMotif()}

      {/* Lab Subtle Grid Overlay */}
      {theme.isLab && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      )}

      {/* Top Bar: Dept + Semester Code + Accent Strip */}
      <div className="relative z-10 flex items-center justify-between border-b border-neutral-800/80 pb-2">
        <span className="font-mono text-[9px] tracking-widest uppercase opacity-70">
          SEM 0{typicalSem}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] tracking-wider uppercase opacity-60 truncate max-w-[80px]">
            {departments[0] || 'ENGG'}
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: theme.accentColor }}
            title={`Rating: ${censorRating}`}
          />
        </div>
      </div>

      {/* Center: Acronym & Dramatic Title */}
      <div className="relative z-10 my-auto py-2 text-center">
        <h2
          className={`font-serif font-bold tracking-tight leading-none text-[#FAF8F5] mb-2 ${acronymSizes[size]}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          {acronym}
        </h2>
        <p className="font-serif italic text-neutral-300 text-[11px] sm:text-[13px] line-clamp-2 px-1 leading-tight opacity-90">
          {title}
        </p>
      </div>

      {/* Bottom Bar: Censor Stamp & Type */}
      <div className="relative z-10 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
        <span
          className="font-mono font-bold text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded tracking-wider"
          style={{
            border: `1px solid ${theme.accentColor}`,
            color: theme.accentColor,
            backgroundColor: `${theme.accentColor}12`
          }}
        >
          {censorRating}
        </span>
        <span className="font-mono text-[8px] tracking-widest uppercase opacity-50">
          {subjectType}
        </span>
      </div>
    </div>
  )
}
