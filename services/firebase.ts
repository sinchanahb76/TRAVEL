import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore
  getReactNativePersistence,
  Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

function sanitize(val: any): string {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function getEnvValue(expoKey: string, viteKey: string): string {
  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[expoKey] || process.env[viteKey];
      if (val) return sanitize(val);
    }
  } catch {}

  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[expoKey] || (import.meta as any).env[viteKey];
      if (val) return sanitize(val);
    }
  } catch {}

  return '';
}

// Support both Expo public environment variables and standard fallback keys
const apiKey = getEnvValue('EXPO_PUBLIC_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY');
const authDomain = getEnvValue('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN');
const projectId = getEnvValue('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID');
const storageBucket = getEnvValue('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET');
const messagingSenderId = getEnvValue('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID');
const appId = getEnvValue('EXPO_PUBLIC_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID');

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

export const isFirebaseConfigured = Boolean(apiKey && authDomain && projectId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      // React Native persistent auth using AsyncStorage
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // Fallback if already initialized
      auth = getAuth(app);
    }
  } else {
    console.warn(
      '[Firebase Mobile] Missing Firebase environment variables. Please set EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, and EXPO_PUBLIC_FIREBASE_PROJECT_ID.'
    );
  }
} catch (error) {
  console.warn('[Firebase Mobile] Initialization note:', error);
}

export { app, auth };
