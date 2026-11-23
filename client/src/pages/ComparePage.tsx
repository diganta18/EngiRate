import React, { useState, useEffect } from 'react'
import { Subject } from '../types'
import { SubjectPoster } from '../components/SubjectPoster'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Swords, ArrowLeft, AlertCircle } from 'lucide-react'

interface CompareData {
  subjects: Subject[]
  radarData: any[]
  verdict: string
}

const COLORS = ['#D97706', '#15803D', '#B91C1C', '#2563EB']

export const ComparePage: React.FC = () => {
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slugs = params.get('slugs')
    if (!slugs) {
      setError('No subject slugs provided for comparison.')
      setLoading(false)
      return
    }

    fetchComparison(slugs)
  }, [])

  const fetchComparison = async (slugs: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/compare?slugs=${encodeURIComponent(slugs)}`)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to compare subjects')
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Error loading comparison')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-[#666660]">
        Calculating relative trauma coordinates...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#141414]">Comparison Incomplete</h2>
        <p className="text-xs font-mono text-[#666660]">{error}</p>
        <a href="/" className="inline-block text-xs font-mono underline text-black">
          Return to Catalog
        </a>
      </div>
    )
  }

  const { subjects, radarData, verdict } = data

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
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
            <Swords className="w-5 h-5 text-amber-600" />
            <h1 className="font-serif text-3xl font-bold text-[#141414]">
              Trauma Comparison (VS Mode)
            </h1>
          </div>
          <p className="text-xs font-mono text-[#666660] mt-1">
            Side-by-side multi-axis radar analysis across {subjects.length} engineering subjects
          </p>
        </div>
        <span className="font-mono text-xs text-[#666660] bg-white border border-[#E6E2DA] px-2.5 py-1 rounded-sm">
          {subjects.map(s => s.acronym).join(' vs ')}
        </span>
      </div>

      {/* Auto-Generated Deadpan Verdict Banner */}
      <div className="paper-card p-4 sm:p-5 border-l-4 border-l-[#0A0A0A] rounded-sm flex items-start gap-3 bg-white">
        <AlertCircle className="w-5 h-5 text-[#0A0A0A] shrink-0 mt-0.5" />
        <div>
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#666660] block mb-0.5">
            Editorial Verdict
          </span>
          <p className="font-serif text-base sm:text-lg font-bold text-[#141414] leading-snug">
            {verdict}
          </p>
        </div>
      </div>

      {/* Visual Posters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subjects.map((sub, idx) => {
          const depts = typeof sub.departments === 'string' ? JSON.parse(sub.departments) : sub.departments
          return (
            <div key={sub.id} className="paper-card p-4 rounded-sm flex flex-col items-center text-center">
              <span
                className="w-3 h-3 rounded-full mb-2"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <SubjectPoster
                acronym={sub.acronym}
                title={sub.title}
                subjectType={sub.subjectType}
                censorRating={sub.censorRating}
                departments={depts}
                typicalSem={sub.typicalSem}
                size="md"
                className="w-full h-auto aspect-[2/3]"
              />
              <h4 className="font-serif font-bold text-sm text-[#141414] mt-2">
                {sub.title}
              </h4>
              <span className="font-mono text-xs text-[#666660]">
                Score: {sub.weightedScore > 0 ? sub.weightedScore.toFixed(1) : '—'}/10
              </span>
            </div>
          )
        })}
      </div>

      {/* 4-Axis Overlaid Radar Chart */}
      <div className="paper-card p-6 rounded-sm space-y-4">
        <div className="border-b border-[#E6E2DA] pb-2">
          <h3 className="font-serif font-bold text-base text-[#141414]">
            4-Axis Relative Trauma Radar
          </h3>
          <p className="text-[11px] font-mono text-[#666660]">
            Comparing 1–10 scores across Overall Cinema, Survival, Brain Melt, and Real Value
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#E6E2DA" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#141414', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: '#666660', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              />
              {subjects.map((sub, idx) => (
                <Radar
                  key={sub.slug}
                  name={`${sub.title} (${sub.acronym})`}
                  dataKey={sub.slug}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0A0A0A] text-[#FAF8F5] text-xs font-mono p-2.5 rounded shadow-lg border border-neutral-700 space-y-1">
                        <strong className="block border-b border-neutral-700 pb-1">{payload[0]?.payload?.metric}</strong>
                        {payload.map((p: any) => (
                          <div key={p.name} className="flex justify-between gap-4">
                            <span style={{ color: p.color }}>{p.name}:</span>
                            <span className="font-bold">{p.value}/10</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: 16,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Metadata Comparison Table */}
      <div className="paper-card rounded-sm overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-[#FAF8F5] border-b border-[#E6E2DA]">
            <tr>
              <th className="p-3 text-left font-bold text-[#666660]">METRIC</th>
              {subjects.map((sub, idx) => (
                <th key={sub.id} className="p-3 text-center font-bold text-[#141414]">
                  <span style={{ color: COLORS[idx % COLORS.length] }}>● </span>
                  {sub.acronym}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E2DA]">
            <tr>
              <td className="p-3 font-semibold text-[#666660]">Censor Classification</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center font-bold">
                  {sub.censorRating}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#666660]">Bayesian Score</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center font-bold text-amber-700">
                  {sub.weightedScore > 0 ? sub.weightedScore.toFixed(2) : '—'}/10
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#666660]">One-Night Survival Odds</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center font-bold text-emerald-700">
                  {sub.avgSurvival.toFixed(1)}/10
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#666660]">Brain Melt Index</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center font-bold text-rose-700">
                  {sub.avgBrainMelt.toFixed(1)}/10
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#666660]">Real Value vs Yap</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center font-bold">
                  {sub.avgValue.toFixed(1)}/10
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#666660]">Typical Semester</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center">
                  Semester {sub.typicalSem}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#666660]">Subject Type</td>
              {subjects.map(sub => (
                <td key={sub.id} className="p-3 text-center">
                  {sub.subjectType}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
