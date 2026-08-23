import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '../../components/Header';
import { FlightCard } from '../../components/FlightCard';
import { searchFlightsService, resolveIata } from '../../services/flightService';
import { CabinClass, FlightOffer, FlightSearchQuery, TripType } from '../../types';

const POPULAR_AIRPORTS = [
  { city: 'New York', code: 'JFK' },
  { city: 'London', code: 'LHR' },
  { city: 'Tokyo', code: 'HND' },
  { city: 'Paris', code: 'CDG' },
  { city: 'Delhi', code: 'DEL' },
  { city: 'Dubai', code: 'DXB' },
  { city: 'Singapore', code: 'SIN' },
  { city: 'San Francisco', code: 'SFO' },
];

const CABIN_CLASSES: Array<{ id: CabinClass; label: string }> = [
  { id: 'ECONOMY', label: 'Economy' },
  { id: 'PREMIUM_ECONOMY', label: 'Prem Econ' },
  { id: 'BUSINESS', label: 'Business' },
  { id: 'FIRST', label: 'First Class' },
];

export default function FlightsScreen() {
  const params = useLocalSearchParams<{
    destination?: string;
    departureDate?: string;
    returnDate?: string;
  }>();

  // Search Form State
  const [origin, setOrigin] = useState('New York (JFK)');
  const [destination, setDestination] = useState(params.destination || 'London (LHR)');
  const [departureDate, setDepartureDate] = useState(
    params.departureDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(
    params.returnDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [passengers, setPassengers] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('ECONOMY');
  const [directOnly, setDirectOnly] = useState<boolean>(false);

  // Search Results
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterNonstopOnly, setFilterNonstopOnly] = useState(false);

  useEffect(() => {
    if (params.destination) {
      setDestination(params.destination);
    }
  }, [params.destination]);

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert('Incomplete Search', 'Please enter both origin and destination cities.');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const query: FlightSearchQuery = {
        origin: origin.trim(),
        destination: destination.trim(),
        departureDate,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        tripType,
        passengers,
        cabinClass,
        directOnly,
      };

      const results = await searchFlightsService(query);
      setFlights(results);
    } catch (error) {
      console.error('[FlightsScreen] Search error:', error);
      Alert.alert('Search Notice', 'Failed to retrieve flights. Showing scheduled routes.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedFlights = filterNonstopOnly
    ? flights.filter((f) => f.stops === 0)
    : flights;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Flight Search"
        subtitle="Aviationstack Real-Time Schedules & Fare Radar"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Panel Card */}
        <View style={styles.searchCard}>
          {/* Trip Type Toggle */}
          <View style={styles.tripTypeRow}>
            <TouchableOpacity
              style={[styles.typeButton, tripType === 'round-trip' && styles.typeButtonActive]}
              onPress={() => setTripType('round-trip')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  tripType === 'round-trip' && styles.typeButtonTextActive,
                ]}
              >
                Round Trip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, tripType === 'one-way' && styles.typeButtonActive]}
              onPress={() => setTripType('one-way')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  tripType === 'one-way' && styles.typeButtonTextActive,
                ]}
              >
                One Way
              </Text>
            </TouchableOpacity>
          </View>

          {/* Origin & Destination with Swap */}
          <View style={styles.inputsBlock}>
            {/* Origin */}
            <View style={styles.airportInputWrapper}>
              <Ionicons name="airplane-outline" size={18} color="#10b981" />
              <View style={styles.airportInputContent}>
                <Text style={styles.inputMiniLabel}>From (Origin)</Text>
                <TextInput
                  style={styles.airportInput}
                  value={origin}
                  onChangeText={setOrigin}
                  placeholder="City or Airport (e.g. JFK)"
                  placeholderTextColor="#71717a"
                />
              </View>
            </View>

            {/* Swap Button */}
            <TouchableOpacity
              style={styles.swapBtn}
              onPress={handleSwapAirports}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={18} color="#10b981" />
            </TouchableOpacity>

            {/* Destination */}
            <View style={styles.airportInputWrapper}>
              <Ionicons name="location-outline" size={18} color="#38bdf8" />
              <View style={styles.airportInputContent}>
                <Text style={styles.inputMiniLabel}>To (Destination)</Text>
                <TextInput
                  style={styles.airportInput}
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="City or Airport (e.g. LHR)"
                  placeholderTextColor="#71717a"
                />
              </View>
            </View>
          </View>

          {/* Quick Airport Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.airportsScroll}
          >
            {POPULAR_AIRPORTS.map((air) => (
              <TouchableOpacity
                key={air.code}
                style={styles.airportPill}
                onPress={() => setDestination(`${air.city} (${air.code})`)}
                activeOpacity={0.7}
              >
                <Text style={styles.airportPillCode}>{air.code}</Text>
                <Text style={styles.airportPillCity}>{air.city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dates */}
          <View style={styles.dateRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.inputMiniLabel}>Departure Date</Text>
              <View style={styles.miniInputWrapper}>
                <Ionicons name="calendar-outline" size={14} color="#10b981" />
                <TextInput
                  style={styles.miniInput}
                  value={departureDate}
                  onChangeText={setDepartureDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#71717a"
                />
              </View>
            </View>

            {tripType === 'round-trip' && (
              <View style={styles.dateBlock}>
                <Text style={styles.inputMiniLabel}>Return Date</Text>
                <View style={styles.miniInputWrapper}>
                  <Ionicons name="calendar-outline" size={14} color="#38bdf8" />
                  <TextInput
                    style={styles.miniInput}
                    value={returnDate}
                    onChangeText={setReturnDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#71717a"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Cabin Class & Passengers */}
          <View style={styles.optionsRow}>
            {/* Passengers Stepper */}
            <View style={styles.passengerStepper}>
              <Text style={styles.inputMiniLabel}>Travelers</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#fafafa" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{passengers}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setPassengers(Math.min(9, passengers + 1))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#fafafa" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Cabin Class Pills */}
          <View style={styles.cabinClassRow}>
            {CABIN_CLASSES.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.cabinPill,
                  cabinClass === cls.id && styles.cabinPillActive,
                ]}
                onPress={() => setCabinClass(cls.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.cabinPillText,
                    cabinClass === cls.id && styles.cabinPillTextActive,
                  ]}
                >
                  {cls.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchBtn, isLoading && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#09090b" />
                <Text style={styles.searchBtnText}>Scanning Airline Routes...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="search" size={18} color="#09090b" />
                <Text style={styles.searchBtnText}>Find Best Flight Deals</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results Section */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsTitle}>Available Flights</Text>
                <Text style={styles.resultsCount}>
                  {displayedFlights.length} {displayedFlights.length === 1 ? 'flight' : 'flights'} found
                </Text>
              </View>

              {/* Filter: Nonstop */}
              <TouchableOpacity
                style={[styles.filterChip, filterNonstopOnly && styles.filterChipActive]}
                onPress={() => setFilterNonstopOnly(!filterNonstopOnly)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filterNonstopOnly ? 'checkmark-circle' : 'funnel-outline'}
                  size={14}
                  color={filterNonstopOnly ? '#09090b' : '#a1a1aa'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filterNonstopOnly && styles.filterChipTextActive,
                  ]}
                >
                  Nonstop Only
                </Text>
              </TouchableOpacity>
            </View>

            {displayedFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}

            {displayedFlights.length === 0 && !isLoading && (
              <View style={styles.emptyResults}>
                <Ionicons name="airplane-outline" size={40} color="#52525b" />
                <Text style={styles.emptyTitle}>No flights found for this filter</Text>
                <Text style={styles.emptySubtitle}>
                  Try turning off the nonstop filter or selecting alternative dates.
                </Text>
              </View>
            )}
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
  searchCard: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
  },
  tripTypeRow: {
    flexDirection: 'row',
    backgroundColor: '#09090b',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: '#18181b',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#10b981',
    fontWeight: '800',
  },
  inputsBlock: {
    gap: 8,
    position: 'relative',
    marginBottom: 12,
  },
  airportInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 10,
  },
  airportInputContent: {
    flex: 1,
  },
  inputMiniLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  airportInput: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  swapBtn: {
    position: 'absolute',
    right: 18,
    top: '42%',
    zIndex: 10,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 20,
    padding: 8,
  },
  airportsScroll: {
    gap: 8,
    marginBottom: 14,
  },
  airportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  airportPillCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
  },
  airportPillCity: {
    fontSize: 11,
    color: '#d4d4d8',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dateBlock: {
    flex: 1,
  },
  miniInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
    height: 44,
  },
  miniInput: {
    flex: 1,
    color: '#fafafa',
    fontSize: 13,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  passengerStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    flex: 1,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    backgroundColor: '#27272a',
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fafafa',
  },
  cabinClassRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  cabinPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#09090b',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cabinPillActive: {
    backgroundColor: '#052e16',
    borderColor: '#10b981',
  },
  cabinPillText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  cabinPillTextActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    height: 52,
    borderRadius: 16,
    gap: 8,
  },
  searchBtnDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090b',
  },
  resultsSection: {
    marginTop: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fafafa',
  },
  resultsCount: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterChipText: {
    fontSize: 12,
    color: '#d4d4d8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#09090b',
    fontWeight: '800',
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#18181b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fafafa',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
