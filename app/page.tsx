import Link from 'next/link'
import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
      </p>

      <div className="my-8 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold tracking-tight mb-2">Career Tracker</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Track your achievements, generate performance review write-ups, and
          prepare STAR answers for your next interview. Works for developers,
          PMs, QAs, designers, and all IT roles.
        </p>
        <Link
          href="/tracker"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Open Tracker
        </Link>
      </div>

      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
