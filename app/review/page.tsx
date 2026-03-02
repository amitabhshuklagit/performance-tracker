'use client'

import Link from 'next/link'
import { ReviewGenerator } from 'app/components/tracker/review-generator'

export default function ReviewPage() {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
        >
          &larr; Back to Tracker
        </Link>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">
          Review Generator
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Generate polished quarterly or yearly performance review write-ups from your
          tracked achievements. Use these for self-reviews, manager discussions, and
          compensation negotiations.
        </p>
      </div>

      <ReviewGenerator />

      <div className="mt-8 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-medium text-sm mb-2">Tips for a Strong Review</h3>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc pl-4">
          <li>Include specific metrics and numbers wherever possible</li>
          <li>Highlight cross-team collaboration and leadership moments</li>
          <li>Connect your work to business outcomes and team goals</li>
          <li>Document challenges you overcame, not just successes</li>
          <li>
            Use the exported markdown as a starting point, then personalize the language
          </li>
        </ul>
      </div>
    </section>
  )
}
