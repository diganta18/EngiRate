import React, { useState } from 'react'
import { Subject, Rating, StatusTag } from '../types'
import { ratingsApi } from '../lib/api'
import { X, AlertCircle } from 'lucide-react'

interface RatingModalProps {
  subject: Subject
  currentRating?: Rating | null
  isGuest?: boolean
  onClose: () => void
  onSuccess: (data: { rating: Rating; subject: Subject; certificate: any; isGuest?: boolean }) => void
}

const GENRES = [
  'Psychological Horror',
  'Filler Episode',
  'Plot Twist Exam',
  'Sleeper Hit',
  'Slow Burn',
  'Pure Fiction',
  'Action-Thriller',
  'Certified GPA Farmer',
]

const STATUS_TAGS: StatusTag[] = [
  'Survived',
  'Barely Escaped',
  'Currently Suffering',
  'Got a Backlog',
  'Certified Topper',
]

export const RatingModal: React.FC<RatingModalProps> = ({
  subject,
  currentRating,
  isGuest = false,
  onClose,
  onSuccess,
}) => {
  const [overall, setOverall] = useState(currentRating?.overall || 7)
  const [survival, setSurvival] = useState(currentRating?.survival || 5)
  const [brainMelt, setBrainMelt] = useState(currentRating?.brainMelt || 6)
  const [realValue, setRealValue] = useState(currentRating?.realValue || 6)
  const [genres, setGenres] = useState<string[]>(currentRating?.genres || [])
  const [statusTag, setStatusTag] = useState<StatusTag>(currentRating?.statusTag || 'Survived')
  const [headline, setHeadline] = useState(currentRating?.review?.headline || '')
  const [body, setBody] = useState(currentRating?.review?.body || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre))
    } else {
      if (genres.length >= 3) return
      setGenres([...genres, genre])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await ratingsApi.submitRate(subject.id, {
        overall,
        survival,
        brainMelt,
        realValue,
        genres,
        statusTag,
        reviewHeadline: headline.trim() || undefined,
        reviewBody: body.trim() || undefined,
      })
      onSuccess(res)
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] border border-[#141414] p-5 sm:p-7 shadow-2xl rounded-sm my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-black transition-colors rounded-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 border-b border-[#E6E2DA] pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono text-[10px] tracking-widest text-[#666660] uppercase">
              Official Review & Rating Dossier
            </span>
            {isGuest && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                Anonymous Guest Mode • No Login Required
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#141414] tracking-tight mt-0.5">
            Rate {subject.title} ({subject.acronym})
          </h2>
        </div>

        {/* Deadpan Zero-Drama Rule Banner */}
        <div className="mb-5 p-3 bg-amber-500/10 border-l-3 border-[#D97706] text-xs text-[#141414] flex items-start gap-2.5 rounded-xs">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#D97706]">The Golden Rule:</strong> Roast the subject, the exam, and the syllabus—never real professors or college staff by name.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 4-Axis Rating Sliders */}
          <div className="space-y-3.5 bg-white p-4 border border-[#E6E2DA] rounded-sm">
            <h3 className="font-serif font-bold text-sm text-[#141414] mb-1">
              The 4-Axis Vibe Metric
            </h3>

            {/* Slider 1: Overall Cinema */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#141414]">Overall Cinema (General enjoyability)</span>
                <span className="font-mono font-bold text-[#D97706]">{overall}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={overall}
                onChange={(e) => setOverall(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#E6E2DA] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: One-Night-Before Survival */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#141414]">One-Night Survival (Syllabus opened at 11 PM)</span>
                <span className="font-mono font-bold text-[#15803D]">{survival}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={survival}
                onChange={(e) => setSurvival(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#E6E2DA] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 3: Brain Melt Index */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#141414]">Brain Melt Index (Cognitive damage)</span>
                <span className="font-mono font-bold text-[#B91C1C]">{brainMelt}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={brainMelt}
                onChange={(e) => setBrainMelt(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#E6E2DA] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 4: Real-World Value vs Pure Yap */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#141414]">Real Value vs Yap (Actual utility vs filler)</span>
                <span className="font-mono font-bold text-stone-700">{realValue}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={realValue}
                onChange={(e) => setRealValue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#E6E2DA] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Completion Status Tag */}
          <div>
            <label className="block text-xs font-semibold text-[#141414] mb-1.5 font-mono uppercase tracking-wider">
              Completion Status Tag
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setStatusTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-sm border font-mono transition-colors ${
                    statusTag === tag
                      ? 'bg-[#0A0A0A] text-[#FAF8F5] border-[#0A0A0A]'
                      : 'bg-white text-[#141414] border-[#E6E2DA] hover:border-neutral-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Selection (Max 3) */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-semibold text-[#141414] font-mono uppercase tracking-wider">
                Cinema Genres (Choose up to 3)
              </label>
              <span className="text-[11px] font-mono text-[#666660]">
                {genres.length}/3 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((genre) => {
                const isSelected = genres.includes(genre)
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`text-xs px-2.5 py-1 rounded-sm border transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-400 font-medium'
                        : 'bg-white text-[#666660] border-[#E6E2DA] hover:border-neutral-400'
                    }`}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Micro-Review Form */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#141414] font-mono uppercase tracking-wider">
              Deadpan Micro-Review (Optional)
            </label>
            <input
              type="text"
              placeholder="Headline (e.g., 'Normalized My Expectations')"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={100}
              className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black font-serif text-[#141414]"
            />
            <div className="relative">
              <textarea
                placeholder="Roast the subject, exam patterns, or 3 AM study rituals (max 500 characters)..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full text-xs p-2.5 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black text-[#141414] resize-none"
              />
              <span className="absolute bottom-2 right-2 text-[10px] font-mono text-[#666660]">
                {body.length}/500
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E6E2DA]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-mono text-[#666660] hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-mono font-medium bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] rounded-sm transition-colors uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Certifying...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
