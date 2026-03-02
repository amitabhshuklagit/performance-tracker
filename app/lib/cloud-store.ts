/**
 * Cloud storage layer using Firestore.
 * Falls back gracefully when Firebase is not configured.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import type { Achievement, TrackerProfile } from './tracker-store'

function getDb() {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not initialized')
  return db
}

// ---- Achievements ----

export async function getCloudAchievements(userId: string): Promise<Achievement[]> {
  try {
    const db = getDb()
    const ref = collection(db, 'users', userId, 'achievements')
    const q = query(ref, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Achievement)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
}

export async function saveCloudAchievement(
  userId: string,
  achievement: Achievement
): Promise<void> {
  try {
    const db = getDb()
    const ref = doc(db, 'users', userId, 'achievements', achievement.id)
    await setDoc(ref, achievement)
  } catch (error) {
    console.error('Error saving achievement:', error)
  }
}

export async function deleteCloudAchievement(
  userId: string,
  achievementId: string
): Promise<void> {
  try {
    const db = getDb()
    const ref = doc(db, 'users', userId, 'achievements', achievementId)
    await deleteDoc(ref)
  } catch (error) {
    console.error('Error deleting achievement:', error)
  }
}

// ---- Profile ----

export async function getCloudProfile(userId: string): Promise<TrackerProfile | null> {
  try {
    const db = getDb()
    const ref = doc(db, 'users', userId, 'settings', 'profile')
    const snapshot = await getDoc(ref)
    return snapshot.exists() ? (snapshot.data() as TrackerProfile) : null
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function saveCloudProfile(
  userId: string,
  profile: TrackerProfile
): Promise<void> {
  try {
    const db = getDb()
    const ref = doc(db, 'users', userId, 'settings', 'profile')
    await setDoc(ref, profile)
  } catch (error) {
    console.error('Error saving profile:', error)
  }
}

// ---- Sync helpers ----

export async function migrateLocalToCloud(userId: string): Promise<number> {
  const localKey = 'career-tracker-achievements'
  const raw = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null
  if (!raw) return 0

  try {
    const localAchievements: Achievement[] = JSON.parse(raw)
    const cloudAchievements = await getCloudAchievements(userId)
    const cloudIds = new Set(cloudAchievements.map((a) => a.id))

    let migrated = 0
    for (const achievement of localAchievements) {
      if (!cloudIds.has(achievement.id)) {
        await saveCloudAchievement(userId, achievement)
        migrated++
      }
    }

    // Also migrate profile
    const profileRaw = localStorage.getItem('career-tracker-profile')
    if (profileRaw) {
      const existingProfile = await getCloudProfile(userId)
      if (!existingProfile) {
        await saveCloudProfile(userId, JSON.parse(profileRaw))
      }
    }

    return migrated
  } catch (error) {
    console.error('Migration error:', error)
    return 0
  }
}
