import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Check, Plus, AlertCircle, X } from 'lucide-react'

interface ArchetypeSectionProps {
  subjectId: number
}

export const ArchetypeSection: React.FC<ArchetypeSectionProps> = ({ subjectId }) => {
  const { user, openAuthModal } = useAuth()
  const [data, setData] = useState<{
    allArchetypes: string[]
    counts: Record<string, number>
    topArchetypes: { key: string; count: number }[]
    userVotes: string[]
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [voting, setVoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArchetypes()
  }, [subjectId])

  const fetchArchetypes = async () => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}/archetypes`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleVoteToggle = async (key: string) => {
    if (!user) {
      openAuthModal('login')
      return
    }

    setVoting(key)
    setError(null)
    try {
      const res = await fetch(`/api/subjects/${subjectId}/archetypes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ archetypeKey: key })
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to vote')
      } else {
        fetchArchetypes()
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setVoting(null)
    }
  }

  if (!data) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-stone-600" />
          <h4 className="font-serif font-bold text-sm text-[#141414]">
            Universal Classroom Archetypes
          </h4>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-mono text-[#666660] hover:text-black flex items-center gap-1 border border-[#E6E2DA] px-2 py-0.5 rounded-sm bg-white"
        >
          <Plus className="w-3 h-3" />
          <span>Vote Tropes ({data.userVotes.length}/2)</span>
        </button>
      </div>

      {/* Top 3 Badges */}
      {data.topArchetypes.length === 0 ? (
        <p className="text-xs font-mono text-[#666660] italic">
          No classroom archetypes voted yet. Be the first to tag this subject's teaching tropes.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.topArchetypes.map((a) => (
            <span
              key={a.key}
              className="text-xs font-mono px-2.5 py-1 rounded-sm bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1.5"
            >
              <span>{a.key}</span>
              <span className="text-[10px] text-stone-500 font-bold">({a.count})</span>
            </span>
          ))}
        </div>
      )}

      {/* Vote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-[#141414] p-6 shadow-2xl rounded-sm">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 border-b border-[#E6E2DA] pb-2">
              <span className="font-mono text-[10px] uppercase text-[#666660] block tracking-wider">
                Community Classification
              </span>
              <h3 className="font-serif text-xl font-bold text-[#141414]">
                Vote Professor Archetypes
              </h3>
              <p className="text-xs text-[#666660] mt-0.5 font-mono">
                Select up to 2 universal tropes defining this classroom experience.
              </p>
            </div>

            {/* Zero-Drama Reminder */}
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-[11px] text-amber-900 rounded-sm mb-3 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Universal tropes only. Never name real faculty members or college staff.</span>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-sm mb-3">
                {error}
              </div>
            )}

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {data.allArchetypes.map((archetype) => {
                const isSelected = data.userVotes.includes(archetype)
                return (
                  <button
                    key={archetype}
                    onClick={() => handleVoteToggle(archetype)}
                    disabled={voting === archetype}
                    className={`w-full flex items-center justify-between p-2.5 rounded text-xs font-mono text-left transition-colors border ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                        : 'bg-white border-[#E6E2DA] hover:border-neutral-400 text-neutral-800'
                    }`}
                  >
                    <span>{archetype}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#666660]">({data.counts[archetype] || 0})</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6E2DA] flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#0A0A0A] text-[#FAF8F5] text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-neutral-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
