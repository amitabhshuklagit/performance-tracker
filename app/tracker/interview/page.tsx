'use client'

import Link from 'next/link'
import { InterviewPrep } from 'app/components/tracker/interview-prep'

export default function InterviewPage() {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/tracker"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
        >
          &larr; Back to Tracker
        </Link>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">Interview Prep</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Turn your achievements into structured STAR (Situation, Task, Action, Result)
          answers for behavioral interviews. Also see likely interview questions based on
          your experience.
        </p>
      </div>

      <InterviewPrep />

      <div className="mt-8 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-medium text-sm mb-2">Interview Tips</h3>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc pl-4">
          <li>
            Practice telling each story in under 2 minutes
          </li>
          <li>
            Always quantify your impact with numbers when possible
          </li>
          <li>
            Prepare 2-3 stories for each common category (leadership, conflict, failure)
          </li>
          <li>
            Tailor stories to the specific role and company you are interviewing for
          </li>
          <li>
            The STAR format works for most behavioral questions. Lead with context, be
            specific about your actions.
          </li>
        </ul>
      </div>
    </section>
  )
}
