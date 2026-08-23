// Base API Configuration for React Native Mobile Application
import Constants from 'expo-constants';

function resolveBaseApiUrl(): string {
  // If explicitly configured via environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // If running in development via Expo Go or Dev Client on physical device / emulator
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`;
  }

  // Fallback relative or production host
  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveBaseApiUrl();
