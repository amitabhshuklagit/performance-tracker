'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from 'app/lib/auth-context'
import { AuthGuard } from 'app/components/auth-guard'
import {
  type Achievement,
  type Role,
  type TrackerProfile,
  ROLE_LABELS,
  groupByQuarter,
} from 'app/lib/tracker-store'
import {
  getCloudAchievements,
  getCloudProfile,
  saveCloudProfile,
  saveCloudAchievement,
  deleteCloudAchievement,
  migrateLocalToCloud,
} from 'app/lib/cloud-store'
import { AchievementForm } from 'app/components/tracker/achievement-form'
import { AchievementList } from 'app/components/tracker/achievement-list'

export default function TrackerPage() {
  return (
    <AuthGuard>
      <TrackerContent />
    </AuthGuard>
  )
}

function TrackerContent() {
  const { user } = useAuth()
  const userId = user!.uid

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TrackerProfile | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<TrackerProfile>({
    name: '',
    role: 'dev',
    team: '',
    company: '',
  })

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await getCloudAchievements(userId)
    setAchievements(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    async function init() {
      // Migrate any local data to cloud on first load
      await migrateLocalToCloud(userId)
      const [, p] = await Promise.all([refresh(), getCloudProfile(userId)])
      if (p) {
        setProfile(p)
        setProfileForm(p)
      }
    }
    init()
  }, [refresh, userId])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await saveCloudProfile(userId, profileForm)
      setProfile(profileForm)
      setShowProfile(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  const totalCount = achievements.length
  const quarters = Array.from(new Set(achievements.map((a) => a.quarter)))
  const categories = Array.from(new Set(achievements.map((a) => a.category)))

  return (
    <section>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tighter mb-2">
            Career Tracker
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Track your achievements, generate review write-ups, and prep for interviews.
          </p>
        </div>
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          {profile ? 'Edit Profile' : 'Set Profile'}
        </button>
      </div>

      {/* Profile Form */}
      {showProfile && (
        <form
          onSubmit={handleSaveProfile}
          className="mb-6 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900 space-y-3"
        >
          <h3 className="font-medium text-sm">Your Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Your Name"
              className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            />
            <select
              value={profileForm.role}
              onChange={(e) =>
                setProfileForm({ ...profileForm, role: e.target.value as Role })
              }
              className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            >
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={profileForm.team}
              onChange={(e) => setProfileForm({ ...profileForm, team: e.target.value })}
              placeholder="Team Name"
              className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            />
            <input
              type="text"
              value={profileForm.company}
              onChange={(e) =>
                setProfileForm({ ...profileForm, company: e.target.value })
              }
              placeholder="Company"
              className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalCount}
            </div>
            <div className="text-xs text-neutral-500">Achievements</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {quarters.length}
            </div>
            <div className="text-xs text-neutral-500">Quarters</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {categories.length}
            </div>
            <div className="text-xs text-neutral-500">Categories</div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/review"
          className="flex-1 text-center py-3 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-sm font-medium"
        >
          Generate Reviews
        </Link>
        <Link
          href="/interview"
          className="flex-1 text-center py-3 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-sm font-medium"
        >
          Interview Prep
        </Link>
      </div>

      {/* Add Achievement */}
      <div className="mb-6">
        <AchievementForm onAdd={refresh} defaultRole={profile?.role} userId={userId} />
      </div>

      {/* Achievement List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          Loading achievements...
        </div>
      ) : (
        <AchievementList achievements={achievements} onUpdate={refresh} userId={userId} />
      )}
    </section>
  )
}
