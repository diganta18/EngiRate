import React, { useState, useRef } from 'react'
import { Review, Comment } from '../types'
import { reviewsApi, moderationApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, Flag, Send, Share2 } from 'lucide-react'
import { exportElementAsPng } from '../lib/exportPng'

interface ReviewCardProps {
  review: Review
  onReactionChange?: () => void
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReactionChange }) => {
  const cardRef = useRef<HTMLElement>(null)
  const { user, openAuthModal } = useAuth()
  const [exportingCard, setExportingCard] = useState(false)
  const [feltThisCount, setFeltThisCount] = useState(review.feltThisCount)
  const [traumaCount, setTraumaCount] = useState(review.traumaCount)
  const [capCount, setCapCount] = useState(review.capCount)
  const [userReaction, setUserReaction] = useState<string | null>(review.userReaction || null)
  
  // Comments state
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newCommentBody, setNewCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Report state
  const [reporting, setReporting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const handleReact = async (type: 'felt_this' | 'trauma' | 'cap') => {
    if (!user) {
      openAuthModal('login')
      return
    }

    try {
      const res = await reviewsApi.react(review.id, type)
      if (type === 'felt_this') {
        setFeltThisCount((prev) => (res.toggled ? prev + 1 : Math.max(0, prev - 1)))
      } else if (type === 'trauma') {
        setTraumaCount((prev) => (res.toggled ? prev + 1 : Math.max(0, prev - 1)))
      } else if (type === 'cap') {
        setCapCount((prev) => (res.toggled ? prev + 1 : Math.max(0, prev - 1)))
      }
      setUserReaction(res.toggled ? type : null)
      if (onReactionChange) onReactionChange()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      try {
        const res = await reviewsApi.getComments(review.id)
        setComments(res.comments)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingComments(false)
      }
    }
    setShowComments(!showComments)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      openAuthModal('login')
      return
    }
    if (!newCommentBody.trim()) return

    setSubmittingComment(true)
    try {
      const res = await reviewsApi.addComment(review.id, newCommentBody.trim())
      setComments([...comments, res.comment])
      setNewCommentBody('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReport = async () => {
    if (!user) {
      openAuthModal('login')
      return
    }
    const reason = prompt('Reason for reporting this review (e.g., named real professor, harassment):')
    if (!reason || reason.trim().length < 5) return

    setReporting(true)
    try {
      await moderationApi.report({
        targetType: 'review',
        targetId: review.id,
        reason: reason.trim(),
      })
      setReportSuccess(true)
      setTimeout(() => setReportSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setReporting(false)
    }
  }

  const handleShareCard = async () => {
    if (!cardRef.current) return
    setExportingCard(true)
    try {
      await exportElementAsPng(cardRef.current, `review-by-${review.user.username}`)
    } catch (err) {
      console.error(err)
    } finally {
      setExportingCard(false)
    }
  }

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <article ref={cardRef} className="paper-card p-4 sm:p-5 rounded-sm transition-all duration-200 relative bg-white">
      {/* Top Metadata Row */}
      <div className="flex items-start justify-between gap-2 border-b border-[#E6E2DA]/80 pb-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/u/${review.user.username}`}
            className="font-mono text-xs font-semibold text-[#141414] hover:underline"
          >
            @{review.user.username}
          </a>
          {review.user.branch && (
            <span className="font-mono text-[10px] text-[#666660] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E6E2DA]">
              {review.user.branch} {review.user.gradYear ? `'${String(review.user.gradYear).slice(2)}` : ''}
            </span>
          )}
          {review.rating?.statusTag && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-300">
              {review.rating.statusTag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {review.rating?.overall && (
            <span className="font-mono font-bold text-xs bg-[#0A0A0A] text-[#FAF8F5] px-2 py-0.5 rounded-sm">
              {review.rating.overall}/10
            </span>
          )}
          <span className="text-[10px] font-mono text-[#666660] hidden sm:inline">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2 mb-4">
        {review.headline && (
          <h4 className="font-serif font-bold text-base text-[#141414] leading-snug">
            "{review.headline}"
          </h4>
        )}
        <p className="text-xs sm:text-sm text-[#141414] leading-relaxed whitespace-pre-wrap font-sans">
          {review.body}
        </p>

        {/* Genres */}
        {review.rating?.genres && review.rating.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {review.rating.genres.map((g) => (
              <span
                key={g}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action / Reaction Bar */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E6E2DA]/80">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reaction 1: Felt This */}
          <button
            onClick={() => handleReact('felt_this')}
            className={`font-mono text-[11px] px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1 ${
              userReaction === 'felt_this'
                ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium'
                : 'bg-white border-[#E6E2DA] text-[#666660] hover:border-neutral-400'
            }`}
            title="Relatable upvote"
          >
            <span>Felt This</span>
            <span className="opacity-70">({feltThisCount})</span>
          </button>

          {/* Reaction 2: Pure Trauma */}
          <button
            onClick={() => handleReact('trauma')}
            className={`font-mono text-[11px] px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1 ${
              userReaction === 'trauma'
                ? 'bg-rose-100 border-rose-400 text-rose-900 font-medium'
                : 'bg-white border-[#E6E2DA] text-[#666660] hover:border-neutral-400'
            }`}
            title="Shared exam pain"
          >
            <span>Pure Trauma</span>
            <span className="opacity-70">({traumaCount})</span>
          </button>

          {/* Reaction 3: Certified Cap */}
          <button
            onClick={() => handleReact('cap')}
            className={`font-mono text-[11px] px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1 ${
              userReaction === 'cap'
                ? 'bg-stone-200 border-stone-400 text-stone-900 font-medium'
                : 'bg-white border-[#E6E2DA] text-[#666660] hover:border-neutral-400'
            }`}
            title="Questionable claim"
          >
            <span>Certified Cap</span>
            <span className="opacity-70">({capCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[#666660]">
          {/* Share Card Button */}
          <button
            onClick={handleShareCard}
            disabled={exportingCard}
            className="flex items-center gap-1 text-[11px] font-mono hover:text-black transition-colors"
            title="Export review as PNG image"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{exportingCard ? 'Exporting...' : 'Share Card'}</span>
          </button>

          {/* Toggle Comments Button */}
          <button
            onClick={toggleComments}
            className="flex items-center gap-1 text-[11px] font-mono hover:text-black transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{review._count?.comments || comments.length}</span>
          </button>

          {/* Report Button */}
          <button
            onClick={handleReport}
            disabled={reporting || reportSuccess}
            className="p-1 hover:text-rose-600 transition-colors"
            title="Report violation of naming rules"
          >
            <Flag className={`w-3.5 h-3.5 ${reportSuccess ? 'text-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1-Level Threaded Comments Section */}
      {showComments && (
        <div className="no-export mt-4 pt-3 border-t border-[#E6E2DA] space-y-3 bg-[#FAF8F5]/50 p-3 rounded-sm">
          <h5 className="font-mono text-[11px] font-semibold text-[#141414] uppercase tracking-wider">
            Discussion ({comments.length})
          </h5>

          {loadingComments ? (
            <p className="text-xs text-[#666660] font-mono">Loading replies...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-[#666660] italic">No replies yet. Speak your mind.</p>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-xs bg-white p-2.5 rounded border border-[#E6E2DA]">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono font-semibold text-[#141414]">
                      @{c.user.username}
                    </span>
                    <span className="text-[10px] font-mono text-[#666660]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-800 leading-relaxed font-sans">{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder={user ? "Add a deadpan reply..." : "Sign in to reply"}
              value={newCommentBody}
              onChange={(e) => setNewCommentBody(e.target.value)}
              disabled={submittingComment}
              className="flex-1 text-xs p-2 bg-white border border-[#E6E2DA] rounded-sm focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={submittingComment || !newCommentBody.trim()}
              className="px-3 py-2 bg-[#0A0A0A] text-[#FAF8F5] text-xs font-mono rounded-sm hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
