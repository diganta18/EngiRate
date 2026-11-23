import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Clapperboard, ThumbsUp, Plus, X } from 'lucide-react'

interface MemeCredit {
  id: number
  roleLabel: string
  creditText: string
  upvotes: number
  user: {
    id: number
    username: string
  }
}

interface CastAndCrewSectionProps {
  subjectId: number
}

const ROLES = ['Starring', 'Supporting Cast', 'Main Villain', 'Plot Twist'] as const

export const CastAndCrewSection: React.FC<CastAndCrewSectionProps> = ({ subjectId }) => {
  const { user, openAuthModal } = useAuth()
  const [groupedCredits, setGroupedCredits] = useState<Record<string, MemeCredit[]>>({
    'Starring': [],
    'Supporting Cast': [],
    'Main Villain': [],
    'Plot Twist': [],
  })
  const [loading, setLoading] = useState(true)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  
  // Submit form state
  const [roleLabel, setRoleLabel] = useState<typeof ROLES[number]>('Starring')
  const [creditText, setCreditText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCredits()
  }, [subjectId])

  const fetchCredits = async () => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}/credits`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setGroupedCredits(json.grouped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (creditId: number) => {
    if (!user) {
      openAuthModal('login')
      return
    }

    try {
      const res = await fetch(`/api/credits/${creditId}/upvote`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        fetchCredits()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmitCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      openAuthModal('login')
      return
    }
    if (!creditText.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/subjects/${subjectId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roleLabel,
          creditText: creditText.trim()
        })
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to submit credit')
      } else {
        setCreditText('')
        setIsSubmitModalOpen(false)
        fetchCredits()
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting credit')
    } finally {
      setSubmitting(false)
    }
  }

  const hasAnyCredits = Object.values(groupedCredits).some(arr => arr.length > 0)

  return (
    <div className="paper-card p-5 rounded-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E2DA]">
        <div>
          <h3 className="font-serif font-bold text-base text-[#141414] flex items-center gap-1.5">
            <Clapperboard className="w-4 h-4 text-neutral-800" />
            <span>Top Cast & Crew</span>
          </h3>
          <p className="text-[11px] font-mono text-[#666660]">
            The real MVPs, villains, and plot twists that shaped the exam season
          </p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="text-xs font-mono text-[#666660] hover:text-black flex items-center gap-1 border border-[#E6E2DA] px-2.5 py-1 rounded-sm bg-white"
        >
          <Plus className="w-3 h-3" />
          <span>Add Credit</span>
        </button>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-[#666660]">Reading cast list...</p>
      ) : !hasAnyCredits ? (
        <div className="text-center py-6 text-xs font-mono text-[#666660] space-y-1">
          <p>No parody cast members added yet.</p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="text-black underline font-semibold"
          >
            Be the first to name the Starring YouTuber or Main Villain.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((role) => {
            const list = groupedCredits[role] || []
            if (list.length === 0) return null

            const roleColor = role === 'Main Villain' ? 'text-rose-700'
              : role === 'Plot Twist' ? 'text-purple-700'
              : role === 'Starring' ? 'text-amber-700'
              : 'text-stone-700'

            return (
              <div key={role} className="space-y-2 bg-[#FAF8F5]/60 p-3.5 rounded border border-[#E6E2DA]">
                <span className={`font-mono text-xs font-bold uppercase tracking-wider block ${roleColor}`}>
                  {role}
                </span>
                <div className="space-y-1.5">
                  {list.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-xs bg-white p-2 rounded border border-[#E6E2DA]/80"
                    >
                      <span className="font-serif font-medium text-[#141414]">
                        "{c.creditText}"
                      </span>
                      <button
                        onClick={() => handleUpvote(c.id)}
                        className="flex items-center gap-1 text-[11px] font-mono text-[#666660] hover:text-black transition-colors pl-2 shrink-0"
                        title="Upvote credit"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{c.upvotes}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Submit Credit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-[#141414] p-6 shadow-2xl rounded-sm">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 border-b border-[#E6E2DA] pb-2">
              <span className="font-mono text-[10px] uppercase text-[#666660] block tracking-wider">
                Parody Credits
              </span>
              <h3 className="font-serif text-xl font-bold text-[#141414]">
                Add Cast & Crew Entry
              </h3>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-sm mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitCredit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Role Group
                </label>
                <select
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-mono"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Credit Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. '3 AM Instant Coffee' or 'Random Indian YouTuber at 2x'"
                  value={creditText}
                  onChange={(e) => setCreditText(e.target.value)}
                  maxLength={100}
                  className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-serif"
                />
              </div>

              <div className="pt-2 border-t border-[#E6E2DA] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#666660] hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
                >
                  {submitting ? 'Adding...' : 'Submit Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
