'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  type Achievement,
  type Role,
  getAchievements,
  getProfile,
  saveProfile,
  addAchievement as addLocalAchievement,
  updateAchievement as updateLocalAchievement,
  deleteAchievement as deleteLocalAchievement,
  saveAchievements as saveLocalAchievements,
  type TrackerProfile,
  ROLE_LABELS,
  calculateStrength,
} from 'app/lib/tracker-store'
import {
  getCloudAchievements,
  saveCloudAchievement,
  deleteCloudAchievement,
  getCloudProfile,
  saveCloudProfile,
  migrateLocalToCloud,
} from 'app/lib/cloud-store'
import { useAuth } from 'app/lib/auth-context'
import { AchievementForm } from 'app/components/tracker/achievement-form'
import { AchievementList } from 'app/components/tracker/achievement-list'

export default function TrackerPage() {
  const { user, isConfigured } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [profile, setProfile] = useState<TrackerProfile | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [migrationDone, setMigrationDone] = useState(false)
  const [profileForm, setProfileForm] = useState<TrackerProfile>({
    name: '',
    role: 'dev',
    team: '',
    company: '',
  })

  const isCloud = isConfigured && user !== null

  const refresh = useCallback(async () => {
    if (isCloud && user) {
      setSyncing(true)
      const cloudData = await getCloudAchievements(user.uid)
      setAchievements(cloudData)
      const cloudProfile = await getCloudProfile(user.uid)
      if (cloudProfile) {
        setProfile(cloudProfile)
        setProfileForm(cloudProfile)
      }
      setSyncing(false)
    } else {
      setAchievements(getAchievements())
      const p = getProfile()
      if (p) {
        setProfile(p)
        setProfileForm(p)
      }
    }
  }, [isCloud, user])

  // Migrate local data to cloud on first sign-in
  useEffect(() => {
    if (isCloud && user && !migrationDone) {
      migrateLocalToCloud(user.uid).then((count) => {
        if (count > 0) {
          console.log(`Migrated ${count} achievements to cloud`)
        }
        setMigrationDone(true)
        refresh()
      })
    }
  }, [isCloud, user, migrationDone, refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (isCloud && user) {
      await saveCloudProfile(user.uid, profileForm)
    } else {
      saveProfile(profileForm)
    }
    setProfile(profileForm)
    setShowProfile(false)
  }

  function handleEdit(achievement: Achievement) {
    setEditingAchievement(achievement)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleFormDone() {
    setEditingAchievement(null)
    await refresh()
  }

  async function handleDelete(id: string) {
    if (isCloud && user) {
      await deleteCloudAchievement(user.uid, id)
    } else {
      deleteLocalAchievement(id)
    }
    await refresh()
  }

  const totalCount = achievements.length
  const quarters = Array.from(new Set(achievements.map((a) => a.quarter)))
  const categories = Array.from(new Set(achievements.map((a) => a.category)))
  const strongCount = achievements.filter((a) => calculateStrength(a).score >= 60).length
  const draftCount = achievements.filter((a) => calculateStrength(a).score < 40).length

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
          {isCloud && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {syncing ? 'Syncing...' : 'Synced to cloud'}
            </p>
          )}
          {!isConfigured && (
            <p className="text-xs text-neutral-400 mt-1">
              Using local storage. Set up Firebase to sync across devices.
            </p>
          )}
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
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Save Profile
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalCount}
            </div>
            <div className="text-xs text-neutral-500">Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {strongCount}
            </div>
            <div className="text-xs text-neutral-500">Review-ready</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {quarters.length}
            </div>
            <div className="text-xs text-neutral-500">Quarters</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {draftCount}
            </div>
            <div className="text-xs text-neutral-500">Need detail</div>
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

      {/* Add / Edit Achievement */}
      <div className="mb-6">
        <AchievementForm
          onAdd={handleFormDone}
          defaultRole={profile?.role}
          editingAchievement={editingAchievement}
          onCancelEdit={() => setEditingAchievement(null)}
          userId={isCloud && user ? user.uid : undefined}
        />
      </div>

      {/* Achievement List */}
      <AchievementList
        achievements={achievements}
        onUpdate={refresh}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </section>
  )
}
