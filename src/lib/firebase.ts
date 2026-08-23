import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

function sanitizeEnv(val: any): string {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function getEnvVar(expoKey: string, viteKey: string): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const val = (import.meta.env as any)[expoKey] || (import.meta.env as any)[viteKey];
      if (val) return sanitizeEnv(val);
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[expoKey] || process.env[viteKey];
      if (val) return sanitizeEnv(val);
    }
  } catch {}

  return '';
}

const firebaseConfig = {
  apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID'),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('[Firebase] Initialized Firebase Auth for project:', firebaseConfig.projectId);
  } else {
    console.warn(
      '[Firebase] Incomplete configuration. Missing EXPO_PUBLIC_FIREBASE_* or VITE_FIREBASE_* (API_KEY, AUTH_DOMAIN, PROJECT_ID).'
    );
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
}

export { app, auth, firebaseConfig };

