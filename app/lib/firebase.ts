import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAzSDnpICDE7pDQBLNyWiS8W1j5UMCnqso',
  authDomain: 'performance-tracker-68015.firebaseapp.com',
  projectId: 'performance-tracker-68015',
  storageBucket: 'performance-tracker-68015.firebasestorage.app',
  messagingSenderId: '263953669220',
  appId: '1:263953669220:web:ee201ab3dfc67e7bb15371',
  measurementId: 'G-RWX71N6NLE',
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

export const googleProvider = new GoogleAuthProvider()

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}

function getApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return app
}

export function getFirebaseDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null
  if (!db) {
    db = getFirestore(getApp())
  }
  return db
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null
  if (!auth) {
    auth = getAuth(getApp())
  }
  return auth
}
