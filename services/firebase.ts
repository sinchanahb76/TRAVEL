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

// Support both Expo public environment variables and standard fallback keys
const apiKey =
  sanitize(process.env.EXPO_PUBLIC_FIREBASE_API_KEY) ||
  sanitize(process.env.VITE_FIREBASE_API_KEY) ||
  '';

const authDomain =
  sanitize(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
  sanitize(process.env.VITE_FIREBASE_AUTH_DOMAIN) ||
  '';

const projectId =
  sanitize(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) ||
  sanitize(process.env.VITE_FIREBASE_PROJECT_ID) ||
  '';

const storageBucket =
  sanitize(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
  sanitize(process.env.VITE_FIREBASE_STORAGE_BUCKET) ||
  '';

const messagingSenderId =
  sanitize(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ||
  sanitize(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
  '';

const appId =
  sanitize(process.env.EXPO_PUBLIC_FIREBASE_APP_ID) ||
  sanitize(process.env.VITE_FIREBASE_APP_ID) ||
  '';

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
