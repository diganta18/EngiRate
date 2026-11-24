import React, { useState, useEffect } from 'react'
import { moderationApi } from '../lib/api'
import { ShieldCheck, Check, Trash2, ArrowLeft, AlertTriangle, Film, CheckCircle2, XCircle } from 'lucide-react'

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'subjects'>('reports')
  const [reports, setReports] = useState<any[]>([])
  const [pendingSubjects, setPendingSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
    fetchPendingSubjects()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await moderationApi.getReports('open')
      setReports(res.reports)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingSubjects = async () => {
    try {
      const res = await fetch('/api/admin/subjects/pending', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setPendingSubjects(json.subjects || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolve = async (id: number, action: 'hide' | 'none') => {
    try {
      await moderationApi.resolveReport(id, 'resolved', action)
      setActionSuccess(`Report #${id} resolved (${action === 'hide' ? 'Content Hidden' : 'No Action'})`)
      setTimeout(() => setActionSuccess(null), 3000)
      fetchReports()
    } catch (err: any) {
      alert(err.message || 'Error resolving report')
    }
  }

  const handleDismiss = async (id: number) => {
    try {
      await moderationApi.resolveReport(id, 'dismissed')
      setActionSuccess(`Report #${id} dismissed`)
      setTimeout(() => setActionSuccess(null), 3000)
      fetchReports()
    } catch (err: any) {
      alert(err.message || 'Error dismissing report')
    }
  }

  const handleApproveSubject = async (id: number, title: string) => {
    try {
      const res = await fetch(`/api/admin/subjects/${id}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (res.ok) {
        setActionSuccess(`Subject "${title}" approved and published to catalog!`)
        setTimeout(() => setActionSuccess(null), 3500)
        fetchPendingSubjects()
      }
    } catch (err: any) {
      alert(err.message || 'Error approving subject')
    }
  }

  const handleRejectSubject = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to reject and remove "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setActionSuccess(`Subject "${title}" rejected and deleted.`)
        setTimeout(() => setActionSuccess(null), 3500)
        fetchPendingSubjects()
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting subject')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666660] hover:text-black transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </a>

      {/* Header */}
      <div className="border-b border-[#E6E2DA] pb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h1 className="font-serif text-3xl font-bold text-[#141414]">Moderation & Admin Ledger</h1>
          </div>
          <p className="text-xs font-mono text-[#666660] mt-1">
            Zero-drama moderation queue & crowd-sourced curriculum proposals
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
          Super Admin Access
        </span>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 rounded-sm">
          {actionSuccess}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E2DA] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-sm border transition-colors ${
            activeTab === 'reports'
              ? 'bg-[#0A0A0A] text-white border-black font-semibold'
              : 'bg-white text-[#666660] border-[#E6E2DA] hover:border-black'
          }`}
        >
          Flagged Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-sm border transition-colors flex items-center gap-1.5 ${
            activeTab === 'subjects'
              ? 'bg-[#0A0A0A] text-white border-black font-semibold'
              : 'bg-white text-[#666660] border-[#E6E2DA] hover:border-black'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Pending Subject Proposals ({pendingSubjects.length})</span>
        </button>
      </div>

      {/* Tab 1: Reports Queue */}
      {activeTab === 'reports' && (
        <section className="space-y-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
            Pending Flagged Content ({reports.length})
          </h3>

          {loading ? (
            <div className="p-12 text-center font-mono text-xs text-[#666660]">
              Loading reported content...
            </div>
          ) : reports.length === 0 ? (
            <div className="paper-card p-12 text-center rounded-sm space-y-2 bg-white border border-[#E6E2DA]">
              <Check className="w-6 h-6 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#141414]">Moderation Queue Clean</h4>
              <p className="text-xs font-mono text-[#666660]">
                No flagged reviews or comments currently require editorial review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="paper-card p-5 rounded-sm space-y-3 bg-white border border-[#E6E2DA]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-black">Report #{rep.id}</span>
                        <span className="text-[#666660]">Target: {rep.targetType} #{rep.targetId}</span>
                        <span className="text-[#666660]">• Reported by @{rep.reporter.username}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Reason: "{rep.reason}"</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolve(rep.id, 'hide')}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-mono rounded-sm transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hide & Resolve</span>
                      </button>
                      <button
                        onClick={() => handleDismiss(rep.id)}
                        className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-mono rounded-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Pending Subject Proposals */}
      {activeTab === 'subjects' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
              Crowd-Sourced Subject Proposals ({pendingSubjects.length})
            </h3>
            <span className="text-xs font-mono text-[#666660]">
              Pending admin verification before entering public catalog
            </span>
          </div>

          {pendingSubjects.length === 0 ? (
            <div className="paper-card p-12 text-center rounded-sm space-y-2 bg-white border border-[#E6E2DA]">
              <Check className="w-6 h-6 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#141414]">No Pending Subjects</h4>
              <p className="text-xs font-mono text-[#666660]">
                All community curriculum submissions have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubjects.map((s) => {
                let depts: string[] = []
                try {
                  depts = JSON.parse(s.departments)
                } catch {
                  depts = [s.departments]
                }

                return (
                  <div key={s.id} className="paper-card p-5 rounded-sm bg-white border border-[#E6E2DA] space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm bg-neutral-100 px-2 py-0.5 rounded-sm text-black">
                            {s.acronym}
                          </span>
                          <span className="font-serif font-bold text-lg text-[#141414]">
                            {s.title}
                          </span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            Sem 0{s.typicalSem} • {s.subjectType}
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-neutral-300 text-neutral-700">
                            Rated {s.censorRating}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-xs text-[#666660]">
                          <span>Departments:</span>
                          <span className="text-black font-medium">{depts.join(', ')}</span>
                          <span className="text-neutral-400">•</span>
                          <span>Slug: <code className="text-neutral-700">{s.slug}</code></span>
                        </div>

                        {s.tagline && (
                          <blockquote className="border-l-2 border-black pl-3 py-0.5 font-serif italic text-xs text-[#44403C]">
                            "{s.tagline}"
                          </blockquote>
                        )}
                      </div>

                      {/* Approve / Reject Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveSubject(s.id, s.title)}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-semibold rounded-sm transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                        <button
                          onClick={() => handleRejectSubject(s.id, s.title)}
                          className="px-3.5 py-2 bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-[#666660] border border-[#E6E2DA] text-xs font-mono rounded-sm transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
