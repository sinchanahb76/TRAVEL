import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItineraryData } from '../types';

const TRIPS_STORAGE_KEY = '@ai_travel_saved_trips';
const PREFS_STORAGE_KEY = '@ai_travel_user_prefs';

export async function getLocalSavedTrips(): Promise<ItineraryData[]> {
  try {
    const json = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (err) {
    console.error('Failed to load trips from storage:', err);
    return [];
  }
}

export async function saveLocalTrip(trip: ItineraryData): Promise<ItineraryData[]> {
  try {
    const existing = await getLocalSavedTrips();
    const index = existing.findIndex((t) => t.id === trip.id);
    let updated: ItineraryData[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = trip;
    } else {
      updated = [trip, ...existing];
    }
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save trip to storage:', err);
    throw err;
  }
}

export async function deleteLocalTrip(tripId: string): Promise<ItineraryData[]> {
  try {
    const existing = await getLocalSavedTrips();
    const updated = existing.filter((t) => t.id !== tripId);
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete trip from storage:', err);
    throw err;
  }
}

export async function getUserPreferences(): Promise<{ currencyCode: string; theme: 'dark' | 'light' }> {
  try {
    const json = await AsyncStorage.getItem(PREFS_STORAGE_KEY);
    if (!json) return { currencyCode: 'USD', theme: 'dark' };
    return JSON.parse(json);
  } catch {
    return { currencyCode: 'USD', theme: 'dark' };
  }
}

export async function saveUserPreferences(prefs: { currencyCode: string; theme: 'dark' | 'light' }) {
  try {
    await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save user preferences:', e);
  }
}
