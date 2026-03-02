'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'app/lib/auth-context'
import {
  type Achievement,
  groupByQuarter,
  groupByYear,
  generateQuarterlyReview,
  generateYearlyReview,
  generatePromotionCase,
  exportToMarkdown,
} from 'app/lib/tracker-store'
import { getCloudAchievements, getCloudProfile } from 'app/lib/cloud-store'

type ReviewMode = 'quarterly' | 'yearly' | 'promotion'

export function ReviewGenerator() {
  const { user } = useAuth()
  const userId = user?.uid || ''

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [reviewType, setReviewType] = useState<ReviewMode>('quarterly')
  const [generatedReview, setGeneratedReview] = useState<string>('')

  useEffect(() => {
    async function load() {
      if (!userId) return
      setLoading(true)
      const data = await getCloudAchievements(userId)
      setAchievements(data)
      setLoading(false)
    }
    load()
  }, [userId])

  const quarters = Object.keys(groupByQuarter(achievements))
  const years = Object.keys(groupByYear(achievements))
  const periods = reviewType === 'quarterly' ? quarters : reviewType === 'yearly' ? years : []

  async function handleGenerate() {
    if (reviewType === 'promotion') {
      const profile = await getCloudProfile(userId)
      setGeneratedReview(generatePromotionCase(achievements, profile))
      return
    }

    if (!selectedPeriod) return
    const profile = await getCloudProfile(userId)

    if (reviewType === 'quarterly') {
      const grouped = groupByQuarter(achievements)
      const items = grouped[selectedPeriod] || []
      setGeneratedReview(generateQuarterlyReview(selectedPeriod, items, profile))
    } else {
      const grouped = groupByYear(achievements)
      const items = grouped[selectedPeriod] || []
      setGeneratedReview(generateYearlyReview(selectedPeriod, items, profile))
    }
  }

  function handleExport() {
    if (!generatedReview) return
    const filename = reviewType === 'promotion'
      ? 'promotion-case.md'
      : `${reviewType}-review-${selectedPeriod.replace(/\s/g, '-').toLowerCase()}.md`
    exportToMarkdown(generatedReview, filename)
  }

  function handleCopy() {
    if (!generatedReview) return
    navigator.clipboard.writeText(generatedReview)
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        Loading achievements...
      </div>
    )
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        <p className="text-lg mb-2">No achievements recorded yet</p>
        <p className="text-sm">
          Add some achievements first, then come back to generate your review.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Review type selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setReviewType('quarterly')
              setSelectedPeriod('')
              setGeneratedReview('')
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reviewType === 'quarterly'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => {
              setReviewType('yearly')
              setSelectedPeriod('')
              setGeneratedReview('')
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reviewType === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => {
              setReviewType('promotion')
              setSelectedPeriod('')
              setGeneratedReview('')
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reviewType === 'promotion'
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Promotion Case
          </button>
        </div>

        {/* Period selector (not for promotion) */}
        {reviewType !== 'promotion' && (
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value)
                setGeneratedReview('')
              }}
              className="flex-1 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            >
              <option value="">
                Select {reviewType === 'quarterly' ? 'quarter' : 'year'}...
              </option>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedPeriod}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        )}

        {/* Promotion generate button */}
        {reviewType === 'promotion' && (
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              Generate a promotion case document from all your achievements. Includes
              evidence of leadership, technical depth, business impact, and scope of influence.
            </p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Build Promotion Case ({achievements.length} achievements)
            </button>
          </div>
        )}
      </div>

      {generatedReview && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Export as Markdown
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 bg-white dark:bg-neutral-900">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed bg-transparent border-0 p-0">
              {generatedReview}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
