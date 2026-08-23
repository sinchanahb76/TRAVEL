import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Header } from '../../components/Header';
import { DayAccordion } from '../../components/DayAccordion';
import { HotelCard } from '../../components/HotelCard';
import { FoodCard } from '../../components/FoodCard';
import { HiddenGemCard } from '../../components/HiddenGemCard';
import { BudgetBreakdownCard } from '../../components/BudgetBreakdownCard';
import { WeatherForecastCard } from '../../components/WeatherForecastCard';
import { MapLocationCard } from '../../components/MapLocationCard';
import { generateItinerary } from '../../services/itineraryService';
import { saveLocalTrip } from '../../services/storageService';
import { BudgetTier, ItineraryData, TripSearchForm } from '../../types';

const POPULAR_DESTINATIONS = ['Tokyo', 'Paris', 'Bali', 'Rome', 'New York', 'Bangkok'];
const TRAVELER_OPTIONS: Array<{ id: 'solo' | 'couple' | 'family' | 'friends'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'solo', label: 'Solo', icon: 'person' },
  { id: 'couple', label: 'Couple', icon: 'heart' },
  { id: 'family', label: 'Family', icon: 'people' },
  { id: 'friends', label: 'Friends', icon: 'happy' },
];

const BUDGET_TIERS: Array<{ id: BudgetTier; label: string; sub: string }> = [
  { id: 'budget', label: 'Budget', sub: 'Backpacker / Saver' },
  { id: 'moderate', label: 'Moderate', sub: 'Comfort & Quality' },
  { id: 'luxury', label: 'Luxury', sub: 'Premium & 5-Star' },
];

const VIBE_OPTIONS = [
  'Sightseeing',
  'Foodie',
  'Adventure',
  'Culture',
  'Relaxation',
  'Shopping',
  'Nature',
  'Nightlife',
];

export default function PlanTripScreen() {
  const router = useRouter();

  // Form State
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0]
  );
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [travelers, setTravelers] = useState<'solo' | 'couple' | 'family' | 'friends'>('couple');
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Sightseeing', 'Foodie', 'Culture']);
  const [customPreferences, setCustomPreferences] = useState('');

  // Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeItinerary, setActiveItinerary] = useState<ItineraryData | null>(null);
  const [activeSection, setActiveSection] = useState<'schedule' | 'stay' | 'food' | 'budget'>('schedule');
  const [isSaving, setIsSaving] = useState(false);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter((v) => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please enter a destination city or region.');
      return;
    }

    setIsGenerating(true);
    try {
      const payload: TripSearchForm = {
        destination: destination.trim(),
        startDate,
        endDate,
        budgetTier,
        travelers,
        vibes: selectedVibes,
        customPreferences,
      };

      const result = await generateItinerary(payload);
      setActiveItinerary(result);
      setActiveSection('schedule');
    } catch (error) {
      console.error('[PlanTrip] Generation error:', error);
      Alert.alert('Generation Error', 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!activeItinerary) return;
    setIsSaving(true);
    try {
      await saveLocalTrip(activeItinerary);
      Alert.alert('Trip Saved!', 'This itinerary has been saved to your My Trips tab.');
    } catch (error) {
      Alert.alert('Save Error', 'Could not save trip to local storage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFindFlights = () => {
    if (!activeItinerary) return;
    router.push({
      pathname: '/(tabs)/flights',
      params: {
        destination: activeItinerary.destination,
        departureDate: activeItinerary.startDate,
        returnDate: activeItinerary.endDate,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="AI Travel Planner"
        subtitle="Generate intelligent custom itineraries in seconds"
        rightAction={
          activeItinerary
            ? {
                icon: 'reload-outline',
                onPress: () => setActiveItinerary(null),
              }
            : undefined
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!activeItinerary ? (
          /* Trip Search & Config Form */
          <View>
            {/* Destination Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Where do you want to go?</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Tokyo, Paris, Bali, New York"
                  placeholderTextColor="#71717a"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>

              {/* Quick Destination Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {POPULAR_DESTINATIONS.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.cityChip, destination === city && styles.cityChipActive]}
                    onPress={() => setDestination(city)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.cityChipText,
                        destination === city && styles.cityChipTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Dates Row */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Travel Dates</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <View style={styles.dateInputWrapper}>
                    <Ionicons name="calendar-outline" size={16} color="#10b981" />
                    <TextInput
                      style={styles.dateInput}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#71717a"
                    />
                  </View>
                </View>

                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <View style={styles.dateInputWrapper}>
                    <Ionicons name="calendar-outline" size={16} color="#10b981" />
                    <TextInput
                      style={styles.dateInput}
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#71717a"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Travelers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who is traveling?</Text>
              <View style={styles.travelersGrid}>
                {TRAVELER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.travelerCard,
                      travelers === opt.id && styles.travelerCardActive,
                    ]}
                    onPress={() => setTravelers(opt.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={travelers === opt.id ? '#10b981' : '#a1a1aa'}
                    />
                    <Text
                      style={[
                        styles.travelerLabel,
                        travelers === opt.id && styles.travelerLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget Tier */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Budget Preference</Text>
              <View style={styles.budgetList}>
                {BUDGET_TIERS.map((tier) => (
                  <TouchableOpacity
                    key={tier.id}
                    style={[styles.budgetCard, budgetTier === tier.id && styles.budgetCardActive]}
                    onPress={() => setBudgetTier(tier.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.budgetRadio}>
                      {budgetTier === tier.id && <View style={styles.budgetRadioDot} />}
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.budgetTitle,
                          budgetTier === tier.id && styles.budgetTitleActive,
                        ]}
                      >
                        {tier.label}
                      </Text>
                      <Text style={styles.budgetSub}>{tier.sub}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vibe Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Vibes & Interests</Text>
              <View style={styles.vibesWrap}>
                {VIBE_OPTIONS.map((vibe) => {
                  const isSelected = selectedVibes.includes(vibe);
                  return (
                    <TouchableOpacity
                      key={vibe}
                      style={[styles.vibePill, isSelected && styles.vibePillActive]}
                      onPress={() => toggleVibe(vibe)}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#09090b" style={styles.vibeCheck} />
                      )}
                      <Text style={[styles.vibeText, isSelected && styles.vibeTextActive]}>
                        {vibe}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specific Requests or Interests (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Vegetarian food spots, art galleries, avoiding stairs, early morning runs..."
                placeholderTextColor="#71717a"
                multiline
                numberOfLines={3}
                value={customPreferences}
                onChangeText={setCustomPreferences}
              />
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              disabled={isGenerating}
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#09090b" />
                  <Text style={styles.generateBtnText}>AI Crafting Your Journey...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#09090b" />
                  <Text style={styles.generateBtnText}>Generate Custom Itinerary</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Rendered Itinerary Detail View */
          <View>
            {/* Itinerary Header Banner */}
            <View style={styles.itineraryBanner}>
              <View style={styles.bannerBadgeRow}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{activeItinerary.numberOfDays} DAYS</Text>
                </View>
                <View style={styles.badgePillSecondary}>
                  <Text style={styles.badgePillTextSecondary}>
                    {activeItinerary.budgetTier.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.badgePillSecondary}>
                  <Text style={styles.badgePillTextSecondary}>
                    {activeItinerary.travelers.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.destHeading}>{activeItinerary.destination}</Text>
              <Text style={styles.destTagline}>{activeItinerary.destinationTagline}</Text>
              <Text style={styles.destOverview}>{activeItinerary.overview}</Text>

              {/* Action Buttons */}
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                  onPress={handleSaveTrip}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <Ionicons name="bookmark" size={16} color="#09090b" />
                  <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save to Trips'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flightBtn}
                  onPress={handleFindFlights}
                  activeOpacity={0.7}
                >
                  <Ionicons name="airplane" size={16} color="#38bdf8" />
                  <Text style={styles.flightBtnText}>Find Flights</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Map Preview */}
            <MapLocationCard
              destination={activeItinerary.destination}
              coordinates={activeItinerary.coordinates}
              tagline={activeItinerary.destinationTagline}
            />

            {/* Weather Widget */}
            {activeItinerary.weatherForecast && (
              <WeatherForecastCard forecast={activeItinerary.weatherForecast} />
            )}

            {/* Nav Tabs (Schedule, Stay, Food, Budget) */}
            <View style={styles.subTabs}>
              <TouchableOpacity
                style={[styles.subTabItem, activeSection === 'schedule' && styles.subTabItemActive]}
                onPress={() => setActiveSection('schedule')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar"
                  size={16}
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
                  size={16}
                  color={activeSection === 'stay' ? '#10b981' : '#a1a1aa'}
                />
                <Text
                  style={[
                    styles.subTabText,
                    activeSection === 'stay' && styles.subTabTextActive,
                  ]}
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
                  size={16}
                  color={activeSection === 'food' ? '#10b981' : '#a1a1aa'}
                />
                <Text
                  style={[
                    styles.subTabText,
                    activeSection === 'food' && styles.subTabTextActive,
                  ]}
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
                  size={16}
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

            {/* Active Tab Content */}
            {activeSection === 'schedule' && (
              <View style={styles.sectionContent}>
                {activeItinerary.days.map((day) => (
                  <DayAccordion key={day.dayNumber} day={day} />
                ))}
              </View>
            )}

            {activeSection === 'stay' && (
              <View style={styles.sectionContent}>
                {activeItinerary.hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </View>
            )}

            {activeSection === 'food' && (
              <View style={styles.sectionContent}>
                <Text style={styles.subHeading}>Culinary Recommendations</Text>
                {activeItinerary.foodSuggestions.map((food) => (
                  <FoodCard key={food.id} food={food} />
                ))}

                <Text style={[styles.subHeading, { marginTop: 16 }]}>Hidden Local Gems</Text>
                {activeItinerary.hiddenGems.map((gem) => (
                  <HiddenGemCard key={gem.id} gem={gem} />
                ))}
              </View>
            )}

            {activeSection === 'budget' && (
              <View style={styles.sectionContent}>
                <BudgetBreakdownCard budget={activeItinerary.budgetBreakdown} />
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
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d4d4d8',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#fafafa',
    fontSize: 15,
  },
  chipScroll: {
    gap: 8,
    marginTop: 10,
  },
  cityChip: {
    backgroundColor: '#18181b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cityChipActive: {
    backgroundColor: '#052e16',
    borderColor: '#10b981',
  },
  cityChipText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: '#34d399',
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#a1a1aa',
    marginBottom: 6,
    fontWeight: '600',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    height: 44,
    color: '#fafafa',
    fontSize: 13,
  },
  travelersGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  travelerCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  travelerCardActive: {
    backgroundColor: '#052e16',
    borderColor: '#10b981',
  },
  travelerLabel: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  travelerLabelActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  budgetList: {
    gap: 8,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 12,
  },
  budgetCardActive: {
    backgroundColor: '#052e16',
    borderColor: '#10b981',
  },
  budgetRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#52525b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d4d4d8',
  },
  budgetTitleActive: {
    color: '#34d399',
  },
  budgetSub: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  vibesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  vibePillActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  vibeCheck: {
    marginRight: 4,
  },
  vibeText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  vibeTextActive: {
    color: '#09090b',
    fontWeight: '800',
  },
  textArea: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 14,
    color: '#fafafa',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#27272a',
    textAlignVertical: 'top',
    height: 80,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    height: 56,
    borderRadius: 18,
    gap: 10,
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#09090b',
  },
  itineraryBanner: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  bannerBadgeRow: {
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
  destHeading: {
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
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#09090b',
  },
  flightBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0369a133',
    borderWidth: 1,
    borderColor: '#0284c744',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  flightBtnText: {
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
  sectionContent: {
    marginTop: 4,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fafafa',
    marginBottom: 12,
  },
});
