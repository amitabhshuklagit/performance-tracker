'use client'

import Link from 'next/link'
import { useAuth } from 'app/lib/auth-context'

const navItems = {
  '/': {
    name: 'tracker',
  },
  '/review': {
    name: 'reviews',
  },
  '/interview': {
    name: 'interviews',
  },
  '/resume': {
    name: 'resume',
  },
}

export function Navbar() {
  const { user, loading, signInWithGoogle, signOut, isConfigured } = useAuth()

  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-center justify-between relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-4">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
                >
                  {name}
                </Link>
              )
            })}
          </div>

          {/* Auth controls */}
          {isConfigured && (
            <div className="flex items-center gap-2 shrink-0">
              {loading ? (
                <span className="text-xs text-neutral-400">...</span>
              ) : user ? (
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-xs text-neutral-500 hidden sm:inline">
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}
