import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import defaultConfig from '../firebase-applet-config.json';

// Support standard Vite client environment variables with fallback to bundled config
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  firestoreDatabaseId:
    env.VITE_FIREBASE_DATABASE_ID || defaultConfig.firestoreDatabaseId || '(default)',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Connection test helper
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or waiting for Firestore connection.');
    }
  }
}

export default app;
