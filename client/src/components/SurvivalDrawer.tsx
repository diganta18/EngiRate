import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { StudyResource } from '../types'
import { useAuth } from '../context/AuthContext'
import { 
  LifeBuoy, 
  ExternalLink, 
  ThumbsUp, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  FileText, 
  Zap, 
  HelpCircle,
  X 
} from 'lucide-react'

interface SurvivalDrawerProps {
  subjectId: number
  subjectTitle: string
}

type TabType = 'All' | 'YouTube' | 'CrashCourse' | 'Notes' | 'PYQ'

export const SurvivalDrawer: React.FC<SurvivalDrawerProps> = ({ subjectId, subjectTitle }) => {
  const { user, openAuthModal } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [resources, setResources] = useState<StudyResource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('All')
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)

  // Submit form state
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [resourceType, setResourceType] = useState<'YouTube' | 'Notes' | 'CrashCourse' | 'PYQ'>('YouTube')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResources()
  }, [subjectId])

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}/resources`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setResources(json.resources || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (resourceId: number) => {
    if (!user) {
      openAuthModal('login')
      return
    }

    try {
      const res = await fetch(`/api/resources/${resourceId}/upvote`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        fetchResources()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      openAuthModal('login')
      return
    }
    if (!title.trim() || !url.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/subjects/${subjectId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          resourceType,
        })
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.fieldErrors?.url?.[0] || json.error || 'Failed to submit resource')
      } else {
        setTitle('')
        setUrl('')
        setIsSubmitOpen(false)
        fetchResources()
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredResources = activeTab === 'All'
    ? resources
    : resources.filter(r => r.resourceType === activeTab)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'YouTube': return <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
      case 'CrashCourse': return <Zap className="w-3.5 h-3.5 text-amber-600" />
      case 'Notes': return <FileText className="w-3.5 h-3.5 text-emerald-600" />
      case 'PYQ': return <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
      default: return <FileText className="w-3.5 h-3.5 text-neutral-600" />
    }
  }

  return (
    <div className="paper-card border border-[#E6E2DA] rounded-sm overflow-hidden bg-white">
      {/* Header / Drawer Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800 shrink-0">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#141414]">
                Emergency 48-Hour Survival Drawer
              </h3>
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-sm bg-neutral-100 text-[#666660]">
                {resources.length} {resources.length === 1 ? 'asset' : 'assets'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#666660] mt-0.5">
              Verified one-shot crash courses, formula sheets & PYQs for the night before
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!user) {
                openAuthModal('login')
                return
              }
              setIsSubmitOpen(true)
            }}
            className="text-[11px] font-mono px-2.5 py-1 rounded-sm border border-[#E6E2DA] bg-white hover:border-black text-[#141414] flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Drop Link</span>
          </button>
          <div className="text-neutral-400 hover:text-black p-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Drawer Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-[#E6E2DA] space-y-4 bg-[#FAF8F5]/50">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            {(['All', 'YouTube', 'CrashCourse', 'Notes', 'PYQ'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-sm transition-colors border ${
                  activeTab === tab
                    ? 'bg-[#0A0A0A] text-[#FAF8F5] border-[#0A0A0A]'
                    : 'bg-white text-[#666660] border-[#E6E2DA] hover:border-black'
                }`}
              >
                {tab === 'All' ? 'All Resources' : tab}
              </button>
            ))}
          </div>

          {/* Resources List */}
          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-[#666660]">
              Loading survival assets...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#E6E2DA] rounded-sm bg-white">
              <LifeBuoy className="w-6 h-6 mx-auto text-neutral-300 mb-2" />
              <p className="font-serif text-sm text-[#141414] font-semibold">
                No emergency resources filed under {activeTab} yet
              </p>
              <p className="text-xs font-mono text-[#666660] mt-1 max-w-sm mx-auto">
                Got a legendary YouTube playlist, handwritten notes, or Drive link that saved you? Drop it here.
              </p>
              <button
                onClick={() => {
                  if (!user) openAuthModal('login')
                  else setIsSubmitOpen(true)
                }}
                className="mt-3 text-xs font-mono px-3 py-1.5 bg-[#0A0A0A] text-white rounded-sm hover:bg-neutral-800"
              >
                + Drop First Resource Link
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredResources.map(res => (
                <div 
                  key={res.id}
                  className="p-3.5 bg-white border border-[#E6E2DA] rounded-sm hover:border-neutral-400 transition-colors flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-neutral-100 flex items-center gap-1 text-neutral-700">
                        {getTypeIcon(res.resourceType)}
                        <span>{res.resourceType}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#666660]">
                        by {res.user.username}
                      </span>
                    </div>

                    <a 
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-sm font-bold text-[#141414] hover:underline flex items-baseline gap-1 group block line-clamp-2"
                    >
                      <span>{res.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 text-neutral-400 group-hover:text-black transition-colors" />
                    </a>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleUpvote(res.id)}
                    className="shrink-0 flex flex-col items-center justify-center min-w-10 px-2 py-1.5 rounded-sm border border-[#E6E2DA] hover:border-black bg-[#FAF8F5] transition-colors group"
                    title="Upvote this survival resource"
                  >
                    <ThumbsUp className="w-3 h-3 text-[#666660] group-hover:text-black transition-colors" />
                    <span className="font-mono text-xs font-bold text-[#141414] mt-0.5">
                      {res.upvotes}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Resource Modal */}
      {isSubmitOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="paper-card w-full max-w-md bg-white p-6 rounded-sm shadow-xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E2DA] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#141414]">
                  Drop a Survival Resource
                </h3>
                <p className="text-xs font-mono text-[#666660]">
                  For {subjectTitle}
                </p>
              </div>
              <button 
                onClick={() => setIsSubmitOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs font-mono rounded-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#666660] mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Gajendra Purohit Fourier Transform Playlist"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-[#E6E2DA] rounded-sm focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#666660] mb-1">
                  URL / Web Link
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/playlist?list=..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 border border-[#E6E2DA] rounded-sm focus:outline-hidden focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#666660] mb-1">
                  Resource Category
                </label>
                <select
                  value={resourceType}
                  onChange={e => setResourceType(e.target.value as any)}
                  className="w-full text-xs font-mono p-2.5 border border-[#E6E2DA] rounded-sm bg-white focus:outline-hidden focus:border-black"
                >
                  <option value="YouTube">YouTube Playlist / Video</option>
                  <option value="CrashCourse">Crash Course / Marathon</option>
                  <option value="Notes">Notes / Formula Sheet (PDF / Drive)</option>
                  <option value="PYQ">Solved Previous Year Papers (PYQs)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E2DA]">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-3.5 py-2 text-xs font-mono text-[#666660] hover:text-black border border-[#E6E2DA] rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-mono bg-[#0A0A0A] hover:bg-neutral-800 text-white rounded-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
