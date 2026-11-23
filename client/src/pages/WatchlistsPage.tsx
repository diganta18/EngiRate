import React, { useState, useEffect } from 'react'
import { Subject } from '../types'
import { subjectsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ListPlus, Heart, Plus, X, Check } from 'lucide-react'

interface UserListSummary {
  id: number
  slug: string
  title: string
  description: string | null
  likesCount: number
  subjectCount: number
  previewSubjects: { id: number; slug: string; title: string; acronym: string; censorRating: string }[]
  user: {
    id: number
    username: string
  }
}

export const WatchlistsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth()
  const [lists, setLists] = useState<UserListSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Create form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/lists')
      if (res.ok) {
        const json = await res.json()
        setLists(json.lists)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = async () => {
    if (!user) {
      openAuthModal('login')
      return
    }
    setIsCreateOpen(true)
    try {
      const res = await subjectsApi.getAll()
      setAllSubjects(res.subjects)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleSelectSubject = (id: number) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds(selectedSubjectIds.filter(i => i !== id))
    } else {
      if (selectedSubjectIds.length >= 20) return
      setSelectedSubjectIds([...selectedSubjectIds, id])
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSubjectIds.length === 0) {
      setError('Select at least 1 subject for your watchlist')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          subjectIds: selectedSubjectIds,
        })
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to create list')
      } else {
        setIsCreateOpen(false)
        setTitle('')
        setDescription('')
        setSelectedSubjectIds([])
        fetchLists()
        window.location.href = `/lists/${json.list.slug}`
      }
    } catch (err: any) {
      setError(err.message || 'Error creating list')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E6E2DA] pb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif text-3xl font-bold text-[#141414]">
              Curated Watchlists
            </h1>
          </div>
          <p className="text-xs font-mono text-[#666660] mt-1">
            Community-assembled semester marathons, survival kits, and horror collections
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Watchlist</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-[#666660]">
          Reading film rolls & student watchlists...
        </div>
      ) : lists.length === 0 ? (
        <div className="paper-card p-12 text-center rounded-sm space-y-2">
          <p className="font-serif text-base text-[#141414]">No watchlists created yet.</p>
          <button
            onClick={handleOpenCreate}
            className="text-xs font-mono text-black underline"
          >
            Create the first community watchlist.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists.map((list) => (
            <a
              key={list.id}
              href={`/lists/${list.slug}`}
              className="paper-card p-5 rounded-sm block hover:border-black transition-all group space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#141414] group-hover:underline">
                    {list.title}
                  </h3>
                  <span className="font-mono text-xs text-[#666660]">
                    Curated by @{list.user.username} • {list.subjectCount} subjects
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs text-[#666660]">
                  <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                  <span>{list.likesCount}</span>
                </div>
              </div>

              {list.description && (
                <p className="text-xs font-serif italic text-neutral-600 line-clamp-2">
                  "{list.description}"
                </p>
              )}

              {/* Subject Badges Preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {list.previewSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E6E2DA] text-neutral-800"
                  >
                    {sub.acronym}
                  </span>
                ))}
                {list.subjectCount > 4 && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-500">
                    +{list.subjectCount - 4} more
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#141414] p-6 shadow-2xl rounded-sm max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 border-b border-[#E6E2DA] pb-2">
              <span className="font-mono text-[10px] uppercase text-[#666660] block tracking-wider">
                Curation Dossier
              </span>
              <h3 className="font-serif text-xl font-bold text-[#141414]">
                Create a Shareable Watchlist
              </h3>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-sm mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateList} className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Watchlist Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 'Safe Final-Year Electives' or 'Subjects That Broke My Soul'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-serif"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Editorial Note / Description (Optional)
                </label>
                <textarea
                  placeholder="Deadpan notes on why these subjects are grouped together..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black resize-none"
                />
              </div>

              {/* Subject Picker */}
              <div className="space-y-1 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-baseline">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#141414]">
                    Select Subjects ({selectedSubjectIds.length} chosen)
                  </label>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-[#E6E2DA] border border-[#E6E2DA] rounded-sm p-1 max-h-48">
                  {allSubjects.map((sub) => {
                    const isSelected = selectedSubjectIds.includes(sub.id)
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => toggleSelectSubject(sub.id)}
                        className={`w-full flex items-center justify-between p-2 text-left text-xs transition-colors ${
                          isSelected ? 'bg-amber-50 font-medium' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="font-serif">{sub.title} ({sub.acronym})</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E2DA] flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#666660] hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
                >
                  {submitting ? 'Publishing...' : 'Publish Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
