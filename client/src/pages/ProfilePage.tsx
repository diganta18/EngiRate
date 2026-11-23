import React, { useState, useEffect, useRef } from 'react'
import { UserProfile, Rating, Subject } from '../types'
import { usersApi, subjectsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { SubjectPoster } from '../components/SubjectPoster'
import { Film, Calendar, BookOpen, Edit3, X, Check, Download } from 'lucide-react'
import { exportElementAsPng } from '../lib/exportPng'

interface ProfilePageProps {
  username: string
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ username }) => {
  const topFourCardRef = useRef<HTMLDivElement>(null)
  const [exportingTopFour, setExportingTopFour] = useState(false)
  const { user: authUser } = useAuth()
  const isOwnProfile = authUser?.username === username

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Top 4 state
  const [isEditingTopFour, setIsEditingTopFour] = useState(false)
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [selectedTopFourIds, setSelectedTopFourIds] = useState<number[]>([])
  const [savingTopFour, setSavingTopFour] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const [resProfile, resRatings] = await Promise.all([
        usersApi.getProfile(username),
        usersApi.getUserRatings(username),
      ])
      setProfile(resProfile.user)
      setRatings(resRatings.ratings)
      setSelectedTopFourIds(resProfile.user.topFour?.map((s) => s.id) || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditTopFour = async () => {
    setIsEditingTopFour(true)
    try {
      const res = await subjectsApi.getAll()
      setAllSubjects(res.subjects)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleSelectSubject = (id: number) => {
    if (selectedTopFourIds.includes(id)) {
      setSelectedTopFourIds(selectedTopFourIds.filter((item) => item !== id))
    } else {
      if (selectedTopFourIds.length >= 4) return
      setSelectedTopFourIds([...selectedTopFourIds, id])
    }
  }

  const handleSaveTopFour = async () => {
    setSavingTopFour(true)
    try {
      await usersApi.updateTopFour(selectedTopFourIds)
      setIsEditingTopFour(false)
      fetchProfile()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingTopFour(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-[#666660]">
        Retrieving academic transcript...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[#141414]">Critic not found</h2>
        <a href="/" className="text-xs font-mono text-[#666660] hover:text-black underline">
          Return to Catalog
        </a>
      </div>
    )
  }

  const getPersonaBadgeStyle = (persona: string) => {
    switch (persona) {
      case 'The Optimist':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'The Realist':
        return 'bg-stone-100 text-stone-800 border-stone-300'
      case 'The Chaos Agent':
        return 'bg-purple-50 text-purple-800 border-purple-300'
      case 'The Phoenix':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'The Veteran':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300'
    }
  }

  const handleExportTopFour = async () => {
    if (!topFourCardRef.current || !profile) return
    setExportingTopFour(true)
    try {
      await exportElementAsPng(topFourCardRef.current, `${profile.username}-Top4-Grid`)
    } catch (err) {
      console.error(err)
    } finally {
      setExportingTopFour(false)
    }
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Transcript Header Profile Card */}
      <section ref={topFourCardRef} className="paper-card p-6 sm:p-8 rounded-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E6E2DA]">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141414] tracking-tight">
                @{profile.username}
              </h1>
              {/* Persona Badge */}
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${getPersonaBadgeStyle(
                  profile.criticPersona
                )}`}
                title="Derived automatically from voting history and rating standard deviation"
              >
                {profile.criticPersona}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#666660] flex-wrap">
              {profile.branch && (
                <span>
                  Branch: <strong className="text-black">{profile.branch}</strong>
                </span>
              )}
              {profile.gradYear && (
                <span>
                  Class of <strong className="text-black">{profile.gradYear}</strong>
                </span>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="font-serif italic text-sm text-[#44403C] pt-1">
                "{profile.bio}"
              </p>
            )}
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-[#E6E2DA] pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="font-mono text-3xl font-bold text-[#141414] block">
                {profile.ratingCount}
              </span>
              <span className="text-[11px] font-mono text-[#666660] block">
                Subjects Rated
              </span>
            </div>
          </div>
        </div>

        {/* Top 4 Favorite Subjects (Letterboxd Style) */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#141414] flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-600" />
                <span>Top 4 Pinned Subjects</span>
              </h3>
              <p className="text-[11px] font-mono text-[#666660]">
                Curated four-poster row defining this student's academic aesthetic
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTopFour}
                disabled={exportingTopFour || !profile.topFour || profile.topFour.length === 0}
                className="no-export text-xs font-mono text-[#666660] hover:text-black flex items-center gap-1 border border-[#E6E2DA] px-2.5 py-1 rounded-sm bg-white disabled:opacity-40"
                title="Export Top 4 posters grid as PNG"
              >
                <Download className="w-3 h-3" />
                <span>{exportingTopFour ? 'Exporting...' : 'Export Grid (PNG)'}</span>
              </button>
              {isOwnProfile && (
                <button
                  onClick={handleOpenEditTopFour}
                  className="no-export text-xs font-mono text-[#666660] hover:text-black flex items-center gap-1 border border-[#E6E2DA] px-2.5 py-1 rounded-sm bg-white"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Top 4</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {profile.topFour && profile.topFour.length > 0 ? (
              profile.topFour.map((sub) => {
                const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
                return (
                  <a
                    key={sub.id}
                    href={`/s/${sub.slug}`}
                    className="group flex flex-col items-center transition-transform hover:-translate-y-1"
                  >
                    <SubjectPoster
                      acronym={sub.acronym}
                      title={sub.title}
                      subjectType={sub.subjectType || 'Core'}
                      censorRating={sub.censorRating || 'PG-13'}
                      departments={depts || ['ENGG']}
                      typicalSem={sub.typicalSem || 1}
                      size="md"
                      className="w-full h-auto aspect-[2/3]"
                    />
                    <span className="font-serif text-xs font-bold text-center mt-2 group-hover:underline truncate max-w-full">
                      {sub.title}
                    </span>
                  </a>
                )
              })
            ) : (
              <div className="col-span-4 p-8 border border-dashed border-[#E6E2DA] rounded-sm text-center bg-[#FAF8F5]/60">
                <p className="text-xs font-mono text-[#666660]">
                  No top subjects pinned yet.
                </p>
                {isOwnProfile && (
                  <button
                    onClick={handleOpenEditTopFour}
                    className="mt-2 text-xs font-mono text-black underline"
                  >
                    Pin 4 favorite subjects
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complete Rating History */}
      <section className="space-y-4">
        <div className="border-b border-[#E6E2DA] pb-2 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-[#141414] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-600" />
            <span>The Transcript Ledger ({ratings.length})</span>
          </h3>
          <span className="font-mono text-xs text-[#666660]">Chronological log</span>
        </div>

        {ratings.length === 0 ? (
          <div className="paper-card p-10 text-center rounded-sm">
            <p className="font-serif text-base text-[#141414]">No subjects rated yet.</p>
          </div>
        ) : (
          <div className="paper-card rounded-sm divide-y divide-[#E6E2DA]">
            {ratings.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/s/${r.subject?.slug}`}
                      className="font-serif font-bold text-base text-[#141414] hover:underline"
                    >
                      {r.subject?.title}
                    </a>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800">
                      {r.subject?.acronym}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-300 text-neutral-700">
                      {r.statusTag}
                    </span>
                  </div>

                  {/* 4-Axis Summary Badges */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Score: {r.overall}/10
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Survival: {r.survival}/10
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      Melt: {r.brainMelt}/10
                    </span>
                  </div>
                </div>

                {r.review && (
                  <div className="mt-2 text-xs font-sans text-neutral-700 bg-white p-3 rounded border border-[#E6E2DA]">
                    {r.review.headline && (
                      <strong className="block font-serif text-xs font-bold text-black mb-1">
                        "{r.review.headline}"
                      </strong>
                    )}
                    <p>{r.review.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Top 4 Modal */}
      {isEditingTopFour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#141414] p-6 shadow-2xl rounded-sm max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E2DA] mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141414]">Pin Your Top 4 Subjects</h3>
                <p className="text-xs font-mono text-[#666660]">
                  {selectedTopFourIds.length}/4 selected
                </p>
              </div>
              <button
                onClick={() => setIsEditingTopFour(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#E6E2DA] pr-1">
              {allSubjects.map((sub) => {
                const isSelected = selectedTopFourIds.includes(sub.id)
                return (
                  <button
                    key={sub.id}
                    onClick={() => toggleSelectSubject(sub.id)}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                      isSelected ? 'bg-amber-50/80 font-medium' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div>
                      <span className="font-serif font-bold text-sm text-[#141414] block">
                        {sub.title} ({sub.acronym})
                      </span>
                      <span className="font-mono text-[10px] text-[#666660]">
                        Sem {sub.typicalSem} • {sub.subjectType}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-700" />}
                  </button>
                )
              })}
            </div>

            <div className="pt-4 border-t border-[#E6E2DA] flex justify-end gap-2">
              <button
                onClick={() => setIsEditingTopFour(false)}
                className="px-4 py-2 text-xs font-mono text-[#666660] hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopFour}
                disabled={savingTopFour}
                className="px-5 py-2 text-xs font-mono font-medium bg-[#0A0A0A] text-[#FAF8F5] rounded-sm hover:bg-neutral-800 uppercase tracking-wider"
              >
                {savingTopFour ? 'Saving...' : 'Confirm Top 4'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
