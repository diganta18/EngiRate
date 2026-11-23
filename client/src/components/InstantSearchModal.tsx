import React, { useState, useEffect, useRef } from 'react'
import { Subject } from '../types'
import { subjectsApi, logEvent } from '../lib/api'
import { SubjectPoster } from './SubjectPoster'
import { Search, X, ArrowRight } from 'lucide-react'

interface InstantSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const InstantSearchModal: React.FC<InstantSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      logEvent('search_queried', { initial: true })
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Alias-aware search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await subjectsApi.getAll({ search: query.trim() })
        setResults(res.subjects)
        logEvent('search_queried', { query: query.trim(), resultCount: res.subjects.length })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-[#141414] shadow-2xl rounded-sm overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-3.5 border-b border-[#E6E2DA] bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, acronym, or alias (OS, M3, DSA, DBMS...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none font-mono text-[#141414] placeholder:text-[#666660]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#666660] hover:text-black px-2 py-1 border border-[#E6E2DA] rounded-sm bg-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#E6E2DA]">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-[#666660]">
              Searching subject catalog & aliases...
            </div>
          ) : query && results.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <p className="font-serif text-base text-[#141414]">No subjects matched "{query}"</p>
              <p className="text-xs font-mono text-[#666660]">
                Try shorthand acronyms like <span className="font-bold">M3</span>, <span className="font-bold">OS</span>, or <span className="font-bold">COA</span>.
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              {results.map((sub) => {
                const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
                return (
                  <a
                    key={sub.id}
                    href={`/s/${sub.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-sm hover:bg-[#FAF8F5] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <SubjectPoster
                        acronym={sub.acronym}
                        title={sub.title}
                        subjectType={sub.subjectType}
                        censorRating={sub.censorRating}
                        departments={depts}
                        typicalSem={sub.typicalSem}
                        size="sm"
                        className="scale-75 origin-left -my-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#141414] group-hover:underline">
                            {sub.title}
                          </span>
                          <span className="font-mono text-xs font-semibold px-1 py-0.2 rounded bg-neutral-100 text-neutral-700">
                            {sub.acronym}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#666660] truncate max-w-sm mt-0.5">
                          Sem {sub.typicalSem} • {depts.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-[#0A0A0A] block">
                          {sub.weightedScore > 0 ? sub.weightedScore.toFixed(1) : '—'}
                          <span className="text-[10px] text-[#666660]">/10</span>
                        </span>
                        <span className="text-[9px] font-mono text-[#666660] block">
                          {sub.voteCount} {sub.voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors" />
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#666660] block">
                Instant Discovery
              </span>
              <p className="text-xs text-[#666660]">
                Search across all 30+ engineering subjects by syllabus acronym, nickname, or formal title.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
