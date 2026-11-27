import React, { useState, useEffect } from 'react'
import { Subject, Review, Rating, Certificate, SubjectDetailResponse } from '../types'
import { subjectsApi, reviewsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'
import { SubjectPoster } from '../components/SubjectPoster'
import { VibeBreakdown } from '../components/VibeBreakdown'
import { VibeHistogram } from '../components/VibeHistogram'
import { ReviewCard } from '../components/ReviewCard'
import { RatingModal } from '../components/RatingModal'
import { CensorCertificateModal } from '../components/CensorCertificateModal'
import { ArchetypeSection } from '../components/ArchetypeSection'
import { CastAndCrewSection } from '../components/CastAndCrewSection'
import { SurvivalDrawer } from '../components/SurvivalDrawer'
import { DirectorsCutModal } from '../components/DirectorsCutModal'
import { CENSOR_META } from '../lib/posterTheme'
import { Star, ArrowLeft, ArrowUpRight, Sparkles, Swords, Check } from 'lucide-react'

interface SubjectDetailPageProps {
  slug: string
}

export const SubjectDetailPage: React.FC<SubjectDetailPageProps> = ({ slug }) => {
  const { user, openAuthModal } = useAuth()
  const { addSubject, removeSubject, isInCompare } = useCompare()
  const inCompare = isInCompare(slug)
  const [data, setData] = useState<SubjectDetailResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsSort, setReviewsSort] = useState<'recent' | 'top' | 'unhinged'>('top')
  const [loading, setLoading] = useState(true)

  // Modals
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [newCertificate, setNewCertificate] = useState<Certificate | null>(null)
  const [showGuestClaimToast, setShowGuestClaimToast] = useState(false)
  
  // Phase 3 Easter Egg: 3x click on Censor Rating Badge
  const [censorClicks, setCensorClicks] = useState(0)
  const [lastCensorClickTime, setLastCensorClickTime] = useState(0)
  const [isDirectorsCutOpen, setIsDirectorsCutOpen] = useState(false)

  const handleCensorBadgeClick = () => {
    const now = Date.now()
    if (now - lastCensorClickTime < 1500) {
      const next = censorClicks + 1
      setCensorClicks(next)
      if (next >= 3) {
        setIsDirectorsCutOpen(true)
        setCensorClicks(0)
      }
    } else {
      setCensorClicks(1)
    }
    setLastCensorClickTime(now)
  }

  useEffect(() => {
    fetchSubjectDetail()
    fetchReviews()
  }, [slug])

  useEffect(() => {
    fetchReviews()
  }, [reviewsSort])

  const fetchSubjectDetail = async () => {
    setLoading(true)
    try {
      const res = await subjectsApi.getBySlug(slug)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!slug) return
    try {
      // First get subject ID if not yet loaded
      const resSub = await subjectsApi.getBySlug(slug)
      const res = await reviewsApi.getBySubject(resSub.subject.id, { sort: reviewsSort })
      setReviews(res.reviews)
      setReviewsTotal(res.total)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRateClick = () => {
    setIsRatingModalOpen(true)
  }

  const handleRatingSuccess = (res: { rating: Rating; subject: Subject; certificate: Certificate; isGuest?: boolean }) => {
    setIsRatingModalOpen(false)
    setData((prev) => prev ? { ...prev, subject: res.subject, userRating: res.rating } : null)
    setNewCertificate(res.certificate)
    if (res.isGuest || !user) {
      setShowGuestClaimToast(true)
    }
    fetchReviews()
  }

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-[#666660]">
        Loading syllabus dossier...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="font-serif text-2xl font-bold text-[#141414]">Subject not found</h2>
        <a href="/" className="text-xs font-mono text-[#666660] hover:text-black underline">
          Return to Catalog
        </a>
      </div>
    )
  }

  const { subject, histogram, topGenres, userRating, cinemaLinks } = data
  const censorMeta = CENSOR_META[subject.censorRating] || CENSOR_META['PG-13']
  const departments = typeof subject.departments === 'string' ? JSON.parse(subject.departments) : subject.departments
  const aliases = typeof subject.aliases === 'string' ? JSON.parse(subject.aliases) : subject.aliases

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Back button */}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666660] hover:text-black transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </a>

      {/* Hero Section */}
      <section className="paper-card p-6 sm:p-8 rounded-sm">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* Left: Deterministic Large Typographic Poster */}
          <div className="shrink-0 mx-auto md:mx-0">
            <SubjectPoster
              acronym={subject.acronym}
              title={subject.title}
              subjectType={subject.subjectType}
              censorRating={subject.censorRating}
              departments={departments}
              typicalSem={subject.typicalSem}
              size="lg"
            />
          </div>

          {/* Right: Subject Details Dossier */}
          <div className="flex-1 space-y-5 w-full">
            {/* Top Bar: Semester + Dept Badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E6E2DA] text-[#666660]">
                  Sem 0{subject.typicalSem}
                </span>
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E6E2DA] text-[#666660]">
                  {subject.subjectType}
                </span>
                {departments.map((d: string) => (
                  <span key={d} className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                    {d}
                  </span>
                ))}
              </div>

              {/* Censor Stamp (Easter Egg trigger on 3x click) */}
              <div
                onClick={handleCensorBadgeClick}
                className="font-mono text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-all hover:shadow-xs"
                style={{
                  color: censorMeta.color,
                  borderColor: censorMeta.color,
                  backgroundColor: `${censorMeta.color}10`,
                }}
                title="Click 3x for Unrated Director's Cut"
              >
                <span>{censorMeta.label}</span>
                {censorClicks > 0 && (
                  <span className="text-[9px] opacity-75 font-mono">
                    [{censorClicks}/3]
                  </span>
                )}
              </div>
            </div>

            {/* Title & Aliases */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#141414] leading-tight">
                {subject.title}
              </h1>
              {aliases && aliases.length > 0 && (
                <p className="font-mono text-xs text-[#666660] mt-1">
                  Also known as: <span className="text-black font-semibold">{aliases.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Deadpan Community Tagline */}
            {subject.tagline && (
              <blockquote className="border-l-2 border-black pl-3 py-0.5 font-serif italic text-sm text-[#44403C] leading-snug">
                "{subject.tagline}"
              </blockquote>
            )}

            {/* Bayesian Score & Primary Actions */}
            <div className="flex items-center justify-between p-4 bg-[#FAF8F5] border border-[#E6E2DA] rounded-sm flex-wrap gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
                  {subject.weightedScore > 0 ? subject.weightedScore.toFixed(1) : '—'}
                </span>
                <div className="text-xs font-mono text-[#666660]">
                  <span>/10 Bayesian Score</span>
                  <span className="block text-[10px] text-neutral-400">
                    {subject.voteCount} community {subject.voteCount === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
              </div>

              {/* Actions Area */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => inCompare ? removeSubject(slug) : addSubject(slug)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-sm text-xs font-mono font-semibold transition-colors border ${
                    inCompare
                      ? 'bg-amber-100 border-amber-400 text-amber-900'
                      : 'bg-white border-[#E6E2DA] hover:border-black text-[#141414]'
                  }`}
                  title="Add to Side-by-Side Trauma Comparison Tray"
                >
                  {inCompare ? <Check className="w-3.5 h-3.5" /> : <Swords className="w-3.5 h-3.5" />}
                  <span>{inCompare ? 'In VS Mode' : '+ VS Compare'}</span>
                </button>

                {/* Rate Action Button */}
                <button
                  onClick={handleRateClick}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono font-semibold rounded-sm uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{userRating ? 'Edit Your Rating' : 'Rate This Subject'}</span>
                </button>
              </div>
            </div>

            {/* Top Community Genres */}
            {topGenres && topGenres.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#666660] block">
                  Top Community Voted Genres
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topGenres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs font-mono px-2.5 py-1 rounded-sm bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Professor Archetypes Section */}
            <div className="pt-2 border-t border-[#E6E2DA]/80">
              <ArchetypeSection subjectId={subject.id} />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Axis Breakdown & Score Histogram */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4-Axis Breakdown */}
        <div className="paper-card p-5 rounded-sm space-y-4">
          <div className="border-b border-[#E6E2DA] pb-2">
            <h3 className="font-serif font-bold text-base text-[#141414]">
              4-Axis Vibe Breakdown
            </h3>
            <p className="text-[11px] font-mono text-[#666660]">
              Aggregated survival odds and cognitive damage
            </p>
          </div>
          <VibeBreakdown
            overall={subject.avgOverall}
            survival={subject.avgSurvival}
            brainMelt={subject.avgBrainMelt}
            realValue={subject.avgValue}
          />
        </div>

        {/* 1-to-10 Rating Histogram */}
        <div className="paper-card p-5 rounded-sm space-y-4">
          <div className="border-b border-[#E6E2DA] pb-2">
            <h3 className="font-serif font-bold text-base text-[#141414]">
              Score Distribution
            </h3>
            <p className="text-[11px] font-mono text-[#666660]">
              Community voting frequency across all 1–10 scores
            </p>
          </div>
          <VibeHistogram distribution={histogram} />
        </div>
      </section>

      {/* Shared Cinematic Universe Cross-References */}
      {cinemaLinks && cinemaLinks.length > 0 && (
        <section className="paper-card p-5 rounded-sm space-y-4">
          <div className="border-b border-[#E6E2DA] pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-[#141414] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Shared Cinematic Universe</span>
              </h3>
              <p className="text-[11px] font-mono text-[#666660]">
                Curriculum prequels, sequels, and recurring exam nightmares
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666660]">
              Canon Lore
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {cinemaLinks.map((link) => (
              <a
                key={link.id}
                href={`/s/${link.slug}`}
                className="p-3 bg-[#FAF8F5] border border-[#E6E2DA] rounded-sm hover:border-black transition-colors group block"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-sm text-[#141414] group-hover:underline">
                    {link.title}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors" />
                </div>
                <span className="font-mono text-[10px] font-semibold text-amber-800 block">
                  {link.relationTitle}
                </span>
                <p className="text-xs text-[#666660] font-sans mt-1 line-clamp-2">
                  {link.relationNote}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Parody Top Cast & Crew Section */}
      <CastAndCrewSection subjectId={subject.id} />

      {/* Emergency 48-Hour Survival Drawer */}
      <SurvivalDrawer
        subjectId={subject.id}
        subjectTitle={subject.title}
      />

      {/* Micro-Reviews Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E2DA] pb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#141414]">
              Community Reviews ({reviewsTotal})
            </h3>
            <p className="text-xs font-mono text-[#666660]">
              Brutally honest student commentary on syllabus trauma
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[#666660] mr-1 hidden sm:inline">Sort:</span>
            <button
              onClick={() => setReviewsSort('top')}
              className={`px-2.5 py-1 rounded-sm border ${
                reviewsSort === 'top'
                  ? 'bg-[#0A0A0A] text-[#FAF8F5] border-black'
                  : 'bg-white text-[#666660] border-[#E6E2DA] hover:text-black'
              }`}
            >
              Most Relatable
            </button>
            <button
              onClick={() => setReviewsSort('unhinged')}
              className={`px-2.5 py-1 rounded-sm border ${
                reviewsSort === 'unhinged'
                  ? 'bg-[#0A0A0A] text-[#FAF8F5] border-black'
                  : 'bg-white text-[#666660] border-[#E6E2DA] hover:text-black'
              }`}
            >
              Most Unhinged
            </button>
            <button
              onClick={() => setReviewsSort('recent')}
              className={`px-2.5 py-1 rounded-sm border ${
                reviewsSort === 'recent'
                  ? 'bg-[#0A0A0A] text-[#FAF8F5] border-black'
                  : 'bg-white text-[#666660] border-[#E6E2DA] hover:text-black'
              }`}
            >
              Newest
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="paper-card p-10 text-center rounded-sm space-y-2">
            <h4 className="font-serif font-bold text-base text-[#141414]">No reviews written yet</h4>
            <p className="text-xs font-mono text-[#666660]">
              Be the first to submit a review and claim your CBSE certificate.
            </p>
            <button
              onClick={handleRateClick}
              className="mt-2 px-4 py-2 bg-[#0A0A0A] text-[#FAF8F5] text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-neutral-800 transition-colors"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                onReactionChange={fetchReviews}
              />
            ))}
          </div>
        )}
      </section>

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <RatingModal
          subject={subject}
          currentRating={userRating}
          isGuest={!user}
          onClose={() => setIsRatingModalOpen(false)}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Non-intrusive Guest Transcript Claim Toast */}
      {showGuestClaimToast && !user && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm bg-[#0A0A0A] text-[#FAF8F5] border border-neutral-800 p-4 rounded-sm shadow-2xl flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 block">
              Rating Recorded
            </span>
            <p className="text-xs font-sans text-neutral-200 leading-snug">
              Want to keep your Critic Transcript, pick a handle, and pin your Top 4?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setShowGuestClaimToast(false)
                  openAuthModal('register')
                }}
                className="px-3 py-1 bg-white text-black font-mono text-[11px] font-semibold rounded-sm hover:bg-neutral-200 transition-colors"
              >
                Claim Account
              </button>
              <button
                onClick={() => setShowGuestClaimToast(false)}
                className="px-2 py-1 text-neutral-400 hover:text-white font-mono text-[11px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Censor Certificate Reveal Modal */}
      {newCertificate && (
        <CensorCertificateModal
          certificate={newCertificate}
          onClose={() => setNewCertificate(null)}
        />
      )}

      {/* Unrated Director's Cut Easter Egg Modal */}
      {data.directorsCut && (
        <DirectorsCutModal
          isOpen={isDirectorsCutOpen}
          onClose={() => setIsDirectorsCutOpen(false)}
          subjectTitle={subject.title}
          subjectAcronym={subject.acronym}
          directorsCut={data.directorsCut}
        />
      )}
    </div>
  )
}
