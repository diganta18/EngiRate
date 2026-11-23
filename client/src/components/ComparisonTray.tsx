import React from 'react'
import { useCompare } from '../context/CompareContext'
import { Swords, X, ArrowRight } from 'lucide-react'

export const ComparisonTray: React.FC = () => {
  const { selectedSlugs, removeSubject, clearSubjects } = useCompare()

  if (selectedSlugs.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl bg-[#0A0A0A] text-[#FAF8F5] border border-neutral-700 shadow-2xl rounded-sm p-3 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-1 font-mono text-xs text-amber-400 font-bold shrink-0 mr-1">
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">VS Mode</span>
          </div>

          {selectedSlugs.map((slug) => (
            <div
              key={slug}
              className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 text-xs font-mono px-2 py-1 rounded-sm shrink-0"
            >
              <span className="uppercase font-bold">{slug.split('-').map(s => s[0]).join('').slice(0, 4)}</span>
              <button
                onClick={() => removeSubject(slug)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearSubjects}
            className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-1"
          >
            Clear
          </button>

          {selectedSlugs.length >= 2 ? (
            <a
              href={`/compare?slugs=${selectedSlugs.join(',')}`}
              className="flex items-center gap-1.5 bg-white text-[#0A0A0A] hover:bg-neutral-200 px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <span>Compare ({selectedSlugs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-1 italic">
              Add 1 more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
