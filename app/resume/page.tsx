'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from 'app/lib/auth-context'
import { AuthGuard } from 'app/components/auth-guard'
import {
  type Achievement,
  generateResumeBullets,
  exportToMarkdown,
} from 'app/lib/tracker-store'
import { getCloudAchievements, getCloudProfile } from 'app/lib/cloud-store'

export default function ResumePage() {
  return (
    <AuthGuard>
      <ResumeContent />
    </AuthGuard>
  )
}

function ResumeContent() {
  const { user } = useAuth()
  const userId = user?.uid || ''

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [generated, setGenerated] = useState('')

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

  async function handleGenerate() {
    const profile = await getCloudProfile(userId)
    setGenerated(generateResumeBullets(achievements, profile))
  }

  function handleCopy() {
    if (!generated) return
    navigator.clipboard.writeText(generated)
  }

  function handleExport() {
    if (!generated) return
    exportToMarkdown(generated, 'resume-bullets.md')
  }

  return (
    <section>
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
        >
          &larr; Back to Tracker
        </Link>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">Resume Builder</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Generate polished resume bullets from your tracked achievements. Copy them
          directly into your resume or LinkedIn profile.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <p className="text-lg mb-2">No achievements yet</p>
          <p className="text-sm">Add achievements first, then generate resume bullets.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Resume Bullets ({achievements.length} achievements)
            </button>
          </div>

          {generated && (
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
                  {generated}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-medium text-sm mb-2">Resume Tips</h3>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc pl-4">
          <li>Start each bullet with a strong action verb</li>
          <li>Include quantified results whenever possible</li>
          <li>Focus on impact and outcomes, not just tasks</li>
          <li>Tailor bullets to the job description you are applying for</li>
          <li>Keep each bullet to 1-2 lines maximum</li>
        </ul>
      </div>
    </section>
  )
}
