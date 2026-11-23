import React, { useRef, useState } from 'react'
import { Certificate } from '../types'
import { CheckCircle2, X, Download } from 'lucide-react'
import { exportElementAsPng } from '../lib/exportPng'

interface CensorCertificateModalProps {
  certificate: Certificate | null
  onClose: () => void
}

export const CensorCertificateModal: React.FC<CensorCertificateModalProps> = ({ certificate, onClose }) => {
  const certRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  if (!certificate) return null

  const handleExportPng = async () => {
    if (!certRef.current) return
    setExporting(true)
    try {
      await exportElementAsPng(certRef.current, `${certificate.certNo}-Certificate`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const getRatingBadgeStyle = (rating?: string) => {
    switch (rating) {
      case 'U':
        return 'border-[#15803D] text-[#15803D] bg-emerald-50'
      case 'PG-13':
        return 'border-[#78716C] text-[#78716C] bg-stone-100'
      case 'R':
        return 'border-[#D97706] text-[#D97706] bg-amber-50'
      case 'NC-17':
        return 'border-[#B91C1C] text-[#B91C1C] bg-rose-50'
      default:
        return 'border-neutral-900 text-neutral-900 bg-neutral-100'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border-2 border-[#141414] p-6 sm:p-8 shadow-2xl rounded-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-black transition-colors rounded-sm"
          aria-label="Close certificate"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Frame */}
        <div ref={certRef} className="border border-[#141414]/30 p-5 sm:p-6 relative bg-white">
          {/* Subtle Corner Accents */}
          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#141414]" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#141414]" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#141414]" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#141414]" />

          {/* Header */}
          <div className="text-center space-y-1 mb-6 border-b border-[#E6E2DA] pb-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#666660] uppercase block">
              Official Examination Board Record
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#141414]">
              Central Board of Semester Exams
            </h2>
            <p className="font-serif italic text-xs text-[#666660]">
              Certificate of Academic Cinema Classification
            </p>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-center my-6">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#666660] uppercase tracking-wider">Candidate</span>
              <p className="font-serif text-lg font-semibold text-[#141414]">@{certificate.username}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#666660] uppercase tracking-wider">Subject Title</span>
              <p className="font-serif text-lg font-bold text-[#141414] leading-snug">{certificate.subjectTitle}</p>
            </div>

            {/* Official Ink Stamp */}
            <div className="py-2 flex justify-center">
              <div
                className={`border-2 border-dashed px-4 py-1.5 rounded-sm inline-block transform -rotate-2 select-none shadow-xs ${getRatingBadgeStyle(certificate.censorRating)}`}
              >
                <span className="font-mono font-bold tracking-widest text-xs uppercase block">
                  {certificate.statusTag}
                </span>
                <span className="font-mono text-[9px] opacity-80 block tracking-normal">
                  Overall Score: {certificate.overall}/10
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-left bg-[#FAF8F5] p-3 border border-[#E6E2DA] rounded-sm text-xs font-mono">
              <div>
                <span className="text-[#666660] block text-[10px]">RECORD NUMBER</span>
                <span className="font-semibold text-[#141414]">{certificate.certNo}</span>
              </div>
              <div>
                <span className="text-[#666660] block text-[10px]">DATE ISSUED</span>
                <span className="font-semibold text-[#141414]">
                  {new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Seals & Watermark */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E6E2DA] text-[10px] font-mono text-[#666660]">
            <div className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Certified on Ledger</span>
            </div>
            <span className="font-bold tracking-wider">ENGIRATE.APP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleExportPng}
            disabled={exporting}
            className="flex items-center justify-center gap-1.5 bg-white border border-[#141414] hover:bg-neutral-100 text-[#141414] text-xs font-medium py-2.5 px-3 rounded-sm transition-colors uppercase tracking-wider font-mono disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Generating...' : 'Export Card (PNG)'}</span>
          </button>
          <button
            onClick={onClose}
            className="w-full bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-medium py-2.5 px-3 rounded-sm transition-colors tracking-wide uppercase font-mono"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}
