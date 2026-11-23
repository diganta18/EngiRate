import React, { useState, useEffect } from 'react'
import { moderationApi } from '../lib/api'
import { ShieldCheck, Check, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react'

export const AdminPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666660] hover:text-black transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </a>

      {/* Header */}
      <div className="border-b border-[#E6E2DA] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h1 className="font-serif text-3xl font-bold text-[#141414]">Moderation Ledger</h1>
          </div>
          <p className="text-xs font-mono text-[#666660] mt-1">
            Zero-drama moderation queue: Enforce the rule against naming real individuals
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
          Admin Access
        </span>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 rounded-sm">
          {actionSuccess}
        </div>
      )}

      {/* Reports Queue */}
      <section className="space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
          Pending Flagged Content ({reports.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-[#666660]">
            Loading reported content...
          </div>
        ) : reports.length === 0 ? (
          <div className="paper-card p-12 text-center rounded-sm space-y-2">
            <Check className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="font-serif font-bold text-base text-[#141414]">Moderation Queue Clean</h4>
            <p className="text-xs font-mono text-[#666660]">
              No flagged reviews or comments currently require editorial review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="paper-card p-5 rounded-sm space-y-3">
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
    </div>
  )
}
