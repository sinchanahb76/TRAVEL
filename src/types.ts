export type BudgetTier = 'budget' | 'moderate' | 'luxury';

export type ActivityTimeSlot = 'morning' | 'afternoon' | 'evening';

export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'culture'
  | 'adventure'
  | 'relaxation'
  | 'shopping'
  | 'nature'
  | 'nightlife';

export interface Activity {
  id: string;
  timeSlot: ActivityTimeSlot;
  title: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  duration: string; // e.g., "2 hours"
  estimatedCostUSD: number;
  category: ActivityCategory;
  insiderTip?: string;
  bestTime?: string;
}

export interface DayItinerary {
  dayNumber: number;
  dateStr?: string;
  title: string;
  summary: string;
  activities: Activity[];
  dailyBudgetEstimateUSD: number;
}

export interface HotelRecommendation {
  id: string;
  name: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  pricePerNightUSD: number;
  rating: number; // 1 to 5
  priceCategory: 'Budget' | 'Moderate' | 'Luxury';
  amenities: string[];
  bookingTip: string;
}

export interface FoodSuggestion {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  mustTryDish: string;
  vibe: string;
}

export interface HiddenGem {
  id: string;
  name: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  whySpecial: string;
  bestTimeToVisit: string;
}

export interface BudgetBreakdown {
  accommodationUSD: number;
  foodAndDiningUSD: number;
  activitiesAndAttractionsUSD: number;
  localTransportUSD: number;
  totalEstimatedUSD: number;
  budgetTips: string[];
}

export interface WeatherDay {
  date: string;
  dayName: string;
  tempC: number;
  tempF: number;
  condition: string;
  icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'thunder' | 'snow';
  humidity: number;
  windSpeedKmh: number;
  packingAdvice: string;
}

export interface ItineraryData {
  id: string;
  createdAt: string;
  destination: string;
  destinationTagline: string;
  coordinates: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  numberOfDays: number;
  budgetTier: BudgetTier;
  travelers: 'solo' | 'couple' | 'family' | 'friends';
  vibes: string[];
  overview: string;
  days: DayItinerary[];
  hotels: HotelRecommendation[];
  foodSuggestions: FoodSuggestion[];
  hiddenGems: HiddenGem[];
  budgetBreakdown: BudgetBreakdown;
  weatherForecast?: WeatherDay[];
  coverImageUrl?: string;
  currency?: string;
}

export interface TripSearchForm {
  destination: string;
  startDate: string;
  endDate: string;
  budgetTier: BudgetTier;
  travelers: 'solo' | 'couple' | 'family' | 'friends';
  vibes: string[];
  customPreferences?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateToUSD: number;
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', rateToUSD: 1, label: 'USD ($)' },
  { code: 'EUR', symbol: '€', rateToUSD: 0.92, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', rateToUSD: 0.79, label: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', rateToUSD: 154.5, label: 'JPY (¥)' },
  { code: 'AUD', symbol: 'A$', rateToUSD: 1.52, label: 'AUD (A$)' },
  { code: 'CAD', symbol: 'C$', rateToUSD: 1.36, label: 'CAD (C$)' },
  { code: 'INR', symbol: '₹', rateToUSD: 83.5, label: 'INR (₹)' },
];

export type TripType = 'one-way' | 'round-trip';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: TripType;
  passengers: number;
  cabinClass: CabinClass;
  directOnly?: boolean;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  originAirport: string;
  originCity: string;
  destinationAirport: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string[];
  price: number;
  currency: string;
  cabinClass: string;
  aircraft?: string;
  seatsRemaining?: number;
  baggage?: {
    carryOn: string;
    checked: string;
  };
  bookingUrl: string;
  provider: string;
  isLive: boolean;
}

