import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
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
    // If not yet configured, initialize placeholder app to avoid crash
    if (getApps().length === 0) {
      app = initializeApp({
        apiKey: 'AIzaSyDemoKeyPlaceholderForExpo12345678',
        authDomain: 'demo-travel-planner.firebaseapp.com',
        projectId: 'demo-travel-planner',
        storageBucket: 'demo-travel-planner.appspot.com',
        messagingSenderId: '1234567890',
        appId: '1:1234567890:web:abcdef123456',
      });
    } else {
      app = getApp();
    }
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
  }
} catch (error) {
  console.warn('[Firebase Mobile] Initialization note:', error);
}

export { app, auth };
