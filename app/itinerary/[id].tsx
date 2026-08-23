import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header } from '../../components/Header';
import { DayAccordion } from '../../components/DayAccordion';
import { HotelCard } from '../../components/HotelCard';
import { FoodCard } from '../../components/FoodCard';
import { HiddenGemCard } from '../../components/HiddenGemCard';
import { BudgetBreakdownCard } from '../../components/BudgetBreakdownCard';
import { WeatherForecastCard } from '../../components/WeatherForecastCard';
import { MapLocationCard } from '../../components/MapLocationCard';
import { getLocalSavedTrips } from '../../services/storageService';
import { ItineraryData } from '../../types';

export default function ItineraryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; tripData?: string }>();

  const [trip, setTrip] = useState<ItineraryData | null>(null);
  const [activeSection, setActiveSection] = useState<'schedule' | 'stay' | 'food' | 'budget'>('schedule');

  useEffect(() => {
    if (params.tripData) {
      try {
        const parsed = JSON.parse(params.tripData);
        setTrip(parsed);
        return;
      } catch (e) {
        console.error('Failed to parse tripData param:', e);
      }
    }

    if (params.id) {
      getLocalSavedTrips().then((trips) => {
        const match = trips.find((t) => t.id === params.id);
        if (match) setTrip(match);
      });
    }
  }, [params.id, params.tripData]);

  const handleShare = async () => {
    if (!trip) return;
    try {
      await Share.share({
        title: `Trip to ${trip.destination}`,
        message: `Check out my ${trip.numberOfDays}-day itinerary for ${trip.destination} crafted by AI Travel Planner!\n\nOverview: ${trip.overview}`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const handleFindFlights = () => {
    if (!trip) return;
    router.push({
      pathname: '/(tabs)/flights',
      params: {
        destination: trip.destination,
        departureDate: trip.startDate,
        returnDate: trip.endDate,
      },
    });
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Itinerary" showBack />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Itinerary not found or loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={trip.destination}
        subtitle={`${trip.numberOfDays} Days Journey`}
        showBack
        rightAction={{
          icon: 'share-social-outline',
          onPress: handleShare,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTags}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{trip.numberOfDays} DAYS</Text>
            </View>
            <View style={styles.badgePillSecondary}>
              <Text style={styles.badgePillTextSecondary}>{trip.budgetTier.toUpperCase()}</Text>
            </View>
            <View style={styles.badgePillSecondary}>
              <Text style={styles.badgePillTextSecondary}>{trip.travelers.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.destTitle}>{trip.destination}</Text>
          <Text style={styles.destTagline}>{trip.destinationTagline}</Text>
          <Text style={styles.destOverview}>{trip.overview}</Text>

          <TouchableOpacity style={styles.flightButton} onPress={handleFindFlights} activeOpacity={0.8}>
            <Ionicons name="airplane" size={16} color="#38bdf8" />
            <Text style={styles.flightButtonText}>Search Live Flights to {trip.destination}</Text>
          </TouchableOpacity>
        </View>

        {/* Map & Coordinates */}
        <MapLocationCard
          destination={trip.destination}
          coordinates={trip.coordinates}
          tagline={trip.destinationTagline}
        />

        {/* Weather Forecast */}
        {trip.weatherForecast && <WeatherForecastCard forecast={trip.weatherForecast} />}

        {/* Navigation Tabs */}
        <View style={styles.subTabs}>
          <TouchableOpacity
            style={[styles.subTabItem, activeSection === 'schedule' && styles.subTabItemActive]}
            onPress={() => setActiveSection('schedule')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar"
              size={15}
              color={activeSection === 'schedule' ? '#10b981' : '#a1a1aa'}
            />
            <Text
              style={[
                styles.subTabText,
                activeSection === 'schedule' && styles.subTabTextActive,
              ]}
            >
              Daily Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabItem, activeSection === 'stay' && styles.subTabItemActive]}
            onPress={() => setActiveSection('stay')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bed"
              size={15}
              color={activeSection === 'stay' ? '#10b981' : '#a1a1aa'}
            />
            <Text
              style={[styles.subTabText, activeSection === 'stay' && styles.subTabTextActive]}
            >
              Hotels
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabItem, activeSection === 'food' && styles.subTabItemActive]}
            onPress={() => setActiveSection('food')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="restaurant"
              size={15}
              color={activeSection === 'food' ? '#10b981' : '#a1a1aa'}
            />
            <Text
              style={[styles.subTabText, activeSection === 'food' && styles.subTabTextActive]}
            >
              Food & Gems
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabItem, activeSection === 'budget' && styles.subTabItemActive]}
            onPress={() => setActiveSection('budget')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="wallet"
              size={15}
              color={activeSection === 'budget' ? '#10b981' : '#a1a1aa'}
            />
            <Text
              style={[
                styles.subTabText,
                activeSection === 'budget' && styles.subTabTextActive,
              ]}
            >
              Budget
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content by section */}
        {activeSection === 'schedule' && (
          <View>
            {trip.days.map((day) => (
              <DayAccordion key={day.dayNumber} day={day} />
            ))}
          </View>
        )}

        {activeSection === 'stay' && (
          <View>
            {trip.hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </View>
        )}

        {activeSection === 'food' && (
          <View>
            <Text style={styles.sectionHeading}>Authentic Dining & Specialty Dishes</Text>
            {trip.foodSuggestions.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}

            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Hidden Local Gems</Text>
            {trip.hiddenGems.map((gem) => (
              <HiddenGemCard key={gem.id} gem={gem} />
            ))}
          </View>
        )}

        {activeSection === 'budget' && (
          <View>
            <BudgetBreakdownCard budget={trip.budgetBreakdown} />
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
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  banner: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  bannerTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badgePill: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#09090b',
  },
  badgePillSecondary: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillTextSecondary: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
  },
  destTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fafafa',
    letterSpacing: -0.5,
  },
  destTagline: {
    fontSize: 13,
    color: '#34d399',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  destOverview: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 19,
    marginBottom: 16,
  },
  flightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0369a133',
    borderWidth: 1,
    borderColor: '#0284c744',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  flightButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  subTabs: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  subTabItemActive: {
    backgroundColor: '#09090b',
  },
  subTabText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#10b981',
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fafafa',
    marginBottom: 12,
  },
});
