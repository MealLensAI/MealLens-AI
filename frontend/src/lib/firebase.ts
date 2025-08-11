import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxXgqvYHlEpL2QpMLPtcEjc23s1O75S2g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "meallensai-40f6f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "meallensai-40f6f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "meallensai-40f6f.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "97250360635",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:97250360635:web:f97290229d0511ae42cb1e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EFFLC7RMFM"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
