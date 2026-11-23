import React, { useState, useEffect } from 'react'
import { Subject } from '../types'
import { useAuth } from '../context/AuthContext'
import { SubjectPoster } from '../components/SubjectPoster'
import { Heart, ArrowLeft, Share2, Check } from 'lucide-react'

interface ListDetail {
  id: number
  slug: string
  title: string
  description: string | null
  likesCount: number
  hasLiked: boolean
  user: {
    id: number
    username: string
    branch: string | null
  }
  subjects: Subject[]
}

interface WatchlistDetailPageProps {
  slug: string
}

export const WatchlistDetailPage: React.FC<WatchlistDetailPageProps> = ({ slug }) => {
  const { user, openAuthModal } = useAuth()
  const [list, setList] = useState<ListDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchList()
  }, [slug])

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/lists/${slug}`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setList(json.list)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!user) {
      openAuthModal('login')
      return
    }

    try {
      const res = await fetch(`/api/lists/${slug}/like`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        const json = await res.json()
        setList(prev => prev ? { ...prev, hasLiked: json.hasLiked, likesCount: json.likesCount } : null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-[#666660]">
        Loading curated syllabus reel...
      </div>
    )
  }

  if (!list) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#141414]">Watchlist not found</h2>
        <a href="/lists" className="text-xs font-mono underline text-black">
          View all watchlists
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <a
        href="/lists"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666660] hover:text-black transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Watchlists</span>
      </a>

      {/* Header Card */}
      <section className="paper-card p-6 sm:p-8 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2DA] pb-4">
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-[#666660]">
              Curated Subject Anthology
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141414] tracking-tight">
              {list.title}
            </h1>
            <p className="font-mono text-xs text-[#666660]">
              Curated by <a href={`/u/${list.user.username}`} className="text-black font-semibold hover:underline">@{list.user.username}</a> • {list.subjects.length} subjects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm border text-xs font-mono transition-colors ${
                list.hasLiked
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                  : 'bg-white border-[#E6E2DA] text-[#666660] hover:text-black'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${list.hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{list.likesCount}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E6E2DA] hover:border-black rounded-sm text-xs font-mono text-[#141414] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>

        {list.description && (
          <p className="font-serif italic text-base text-[#44403C] leading-relaxed">
            "{list.description}"
          </p>
        )}
      </section>

      {/* Ordered Subjects Grid */}
      <section className="space-y-4">
        <div className="border-b border-[#E6E2DA] pb-2">
          <h3 className="font-serif text-xl font-bold text-[#141414]">
            Anthology Entries ({list.subjects.length})
          </h3>
        </div>

        <div className="space-y-3">
          {list.subjects.map((sub, idx) => {
            const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
            return (
              <a
                key={sub.id}
                href={`/s/${sub.slug}`}
                className="paper-card p-4 rounded-sm flex items-center justify-between gap-4 hover:border-black transition-all group block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono font-bold text-base text-[#666660] w-6 text-center shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <SubjectPoster
                    acronym={sub.acronym}
                    title={sub.title}
                    subjectType={sub.subjectType}
                    censorRating={sub.censorRating}
                    departments={depts}
                    typicalSem={sub.typicalSem}
                    size="sm"
                    className="scale-90 origin-left shrink-0"
                  />

                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-base text-[#141414] group-hover:underline truncate">
                      {sub.title}
                    </h4>
                    <span className="font-mono text-xs text-[#666660] block mt-0.5">
                      {sub.acronym} • Sem {sub.typicalSem} • {depts.join(', ')}
                    </span>
                    {sub.tagline && (
                      <p className="font-serif italic text-xs text-neutral-500 line-clamp-1 mt-1 hidden sm:block">
                        "{sub.tagline}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-sm text-[#0A0A0A] block">
                    {sub.weightedScore > 0 ? sub.weightedScore.toFixed(1) : '—'}
                    <span className="text-[10px] text-[#666660]">/10</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 block">
                    Survival: {sub.avgSurvival.toFixed(1)}/10
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}
