import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Header } from '../../components/Header';
import { TripCard } from '../../components/TripCard';
import { getLocalSavedTrips, deleteLocalTrip } from '../../services/storageService';
import { ItineraryData } from '../../types';

export default function MyTripsScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<ItineraryData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTrips = async () => {
    try {
      const stored = await getLocalSavedTrips();
      setTrips(stored);
    } catch (e) {
      console.error('[MyTripsScreen] load error:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTrips();
    setIsRefreshing(false);
  };

  const handleDeleteTrip = (trip: ItineraryData) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to remove "${trip.destination}" from your saved trips?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await deleteLocalTrip(trip.id);
              setTrips(updated);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete trip.');
            }
          },
        },
      ]
    );
  };

  const handleOpenTrip = (trip: ItineraryData) => {
    router.push({
      pathname: '/itinerary/[id]',
      params: { id: trip.id, tripData: JSON.stringify(trip) },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My Trips"
        subtitle={`${trips.length} saved ${trips.length === 1 ? 'itinerary' : 'itineraries'}`}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }
      >
        {trips.length > 0 ? (
          trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => handleOpenTrip(trip)}
              onDelete={() => handleDeleteTrip(trip)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="briefcase-outline" size={44} color="#10b981" />
            </View>
            <Text style={styles.emptyTitle}>No Saved Journeys Yet</Text>
            <Text style={styles.emptySubtitle}>
              Plan and generate custom itineraries with AI to save your adventures here.
            </Text>

            <TouchableOpacity
              style={styles.planBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}
            >
              <Ionicons name="compass" size={18} color="#09090b" />
              <Text style={styles.planBtnText}>Plan Your First Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#10b98144',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fafafa',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: 24,
  },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  planBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090b',
  },
});
