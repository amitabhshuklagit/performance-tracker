import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAzSDnpICDE7pDQBLNyWiS8W1j5UMCnqso',
  authDomain: 'performance-tracker-68015.firebaseapp.com',
  projectId: 'performance-tracker-68015',
  storageBucket: 'performance-tracker-68015.firebasestorage.app',
  messagingSenderId: '263953669220',
  appId: '1:263953669220:web:ee201ab3dfc67e7bb15371',
  measurementId: 'G-RWX71N6NLE',
}

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
