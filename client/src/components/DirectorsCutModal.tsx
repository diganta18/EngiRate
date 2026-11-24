import React from 'react'
import { createPortal } from 'react-dom'
import { DirectorsCut } from '../types'
import { X, Clapperboard, AlertTriangle, Users, BarChart3, ShieldAlert } from 'lucide-react'

interface DirectorsCutModalProps {
  isOpen: boolean
  onClose: () => void
  subjectTitle: string
  subjectAcronym: string
  directorsCut: DirectorsCut
}

export const DirectorsCutModal: React.FC<DirectorsCutModalProps> = ({
  isOpen,
  onClose,
  subjectTitle,
  subjectAcronym,
  directorsCut,
}) => {
  if (!isOpen) return null

  const { scoreStddev, variance, voteCounts, branchBreakdown, statusTagCounts, totalVotes } = directorsCut

  // Variance commentary
  const getVarianceAnalysis = (sigma: number) => {
    if (sigma >= 2.0) {
      return 'Severe Academic Polarization. Students either experienced spiritual enlightenment or total cognitive ruin. There was virtually no middle ground.'
    } else if (sigma <= 1.0) {
      return 'High Consensus Trauma. Universal agreement across all student demographics. The syllabus is predictably brutal.'
    }
    return 'Standard Academic Variance. Normal distribution of survivors, casualties, and caffeine-driven passes.'
  }

  const casualtyTotal = Object.values(statusTagCounts).reduce((a, b) => a + b, 0) || 1

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="paper-card w-full max-w-2xl bg-[#0A0A0A] text-[#FAF8F5] p-6 sm:p-8 rounded-sm shadow-2xl border border-neutral-800 space-y-6 my-auto max-h-[90vh] overflow-y-auto">
        {/* Film Slate Header */}
        <div className="border-b border-neutral-800 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm bg-red-950 text-red-400 border border-red-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>CONFIDENTIAL • UNRATED DIRECTOR'S CUT</span>
              </span>
              <span className="font-mono text-[10px] text-neutral-500">
                Easter Egg Unlocked (3x Click)
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
              {subjectTitle} ({subjectAcronym})
            </h2>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Raw mathematical evidence, departmental polarization & casualty distribution
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistical Variance Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 block">
              Standard Deviation (σ)
            </span>
            <span className="font-mono text-2xl font-bold text-amber-400 mt-1 block">
              {scoreStddev.toFixed(2)}
            </span>
            <span className="font-mono text-[10px] text-neutral-400">
              Measure of polarization
            </span>
          </div>

          <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 block">
              Variance (σ²)
            </span>
            <span className="font-mono text-2xl font-bold text-neutral-200 mt-1 block">
              {variance.toFixed(2)}
            </span>
            <span className="font-mono text-[10px] text-neutral-400">
              Statistical spread
            </span>
          </div>

          <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 block">
              Total Ballots
            </span>
            <span className="font-mono text-2xl font-bold text-[#FAF8F5] mt-1 block">
              {totalVotes}
            </span>
            <span className="font-mono text-[10px] text-neutral-400">
              Recorded community votes
            </span>
          </div>
        </div>

        {/* Editorial Commentary on Variance */}
        <div className="p-3.5 bg-neutral-900/50 border-l-2 border-l-amber-500 border border-neutral-800/80 rounded-sm text-xs font-mono text-neutral-300">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
            Statistical Analysis
          </span>
          <p>{getVarianceAnalysis(scoreStddev)}</p>
        </div>

        {/* Branch-by-Branch Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Users className="w-4 h-4 text-neutral-400" />
            <h4 className="font-serif font-bold text-sm text-[#FAF8F5]">
              Departmental Polarization (Branch Breakdown)
            </h4>
          </div>

          {branchBreakdown.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 italic">
              Insufficient branch metadata collected for this subject.
            </p>
          ) : (
            <div className="space-y-2">
              {branchBreakdown.map(b => (
                <div key={b.branch} className="flex items-center justify-between text-xs font-mono gap-3">
                  <span className="text-neutral-300 w-28 truncate">{b.branch}</span>
                  <div className="flex-1 bg-neutral-800 h-2.5 rounded-xs overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-xs transition-all duration-500"
                      style={{ width: `${Math.min(100, (b.avgScore / 10) * 100)}%` }}
                    />
                  </div>
                  <div className="text-right w-20">
                    <span className="font-bold text-white">{b.avgScore}</span>
                    <span className="text-[10px] text-neutral-500 ml-1">({b.count} votes)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Casualty Report (Status Tag Breakdown) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h4 className="font-serif font-bold text-sm text-[#FAF8F5]">
              Casualty Report (Student Status Tags)
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            {Object.entries(statusTagCounts).map(([tag, count]) => {
              const pct = Math.round((count / casualtyTotal) * 100)
              return (
                <div key={tag} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-sm">
                  <span className="text-[10px] text-neutral-400 block truncate" title={tag}>
                    {tag}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-bold text-sm text-white">{count}</span>
                    <span className="text-[10px] text-neutral-500">({pct}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Exact 1-10 Ballot Distribution Table */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <BarChart3 className="w-4 h-4 text-neutral-400" />
            <h4 className="font-serif font-bold text-sm text-[#FAF8F5]">
              Raw Ballot Distribution (1 through 10)
            </h4>
          </div>

          <div className="flex items-end justify-between gap-1 pt-3 h-24">
            {voteCounts.map(item => {
              const maxCount = Math.max(1, ...voteCounts.map(v => v.count))
              const heightPct = Math.round((item.count / maxCount) * 100)
              return (
                <div key={item.score} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-mono text-neutral-400">{item.count}</span>
                  <div 
                    className="w-full bg-neutral-700 hover:bg-amber-400 transition-colors rounded-xs"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                    title={`Score ${item.score}: ${item.count} votes`}
                  />
                  <span className="text-[10px] font-mono text-neutral-500">{item.score}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
            EngiRate Deep-Cinema Telemetry • Archive Copy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono bg-white text-black hover:bg-neutral-200 rounded-sm font-semibold transition-colors"
          >
            Close Slate
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
