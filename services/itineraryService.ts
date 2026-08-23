import { ItineraryData, TripSearchForm } from '../types';
import { API_BASE_URL } from './apiConfig';

const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.006 },
  nyc: { lat: 40.7128, lng: -74.006 },
  rome: { lat: 41.9028, lng: 12.4964 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  bali: { lat: -8.4095, lng: 115.1889 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  goa: { lat: 15.2993, lng: 74.124 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
};

export function getFallbackCoords(destination: string): { lat: number; lng: number } {
  const norm = destination.toLowerCase().trim();
  for (const [key, coords] of Object.entries(DESTINATION_COORDS)) {
    if (norm.includes(key)) return coords;
  }
  return { lat: 40.7128, lng: -74.006 };
}

export function generateSmartLocalItinerary(form: TripSearchForm): ItineraryData {
  const destination = form.destination.trim() || 'Global Destination';
  const start = form.startDate ? new Date(form.startDate) : new Date(Date.now() + 86400000 * 7);
  const end = form.endDate ? new Date(form.endDate) : new Date(start.getTime() + 86400000 * 4);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const numberOfDays = Math.max(1, Math.min(14, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));
  const baseCoords = getFallbackCoords(destination);

  const mult = form.budgetTier === 'luxury' ? 2.8 : form.budgetTier === 'budget' ? 0.6 : 1.2;

  const days = Array.from({ length: numberOfDays }, (_, i) => {
    const dayNum = i + 1;
    const dayDate = new Date(start.getTime() + i * 86400000);
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      dayNumber: dayNum,
      dateStr,
      title: `Day ${dayNum}: ${destination} Heritage & Cultural Discovery`,
      summary: `Immerse in landmark architecture, bustling local streets, and curated cuisine across ${destination}.`,
      dailyBudgetEstimateUSD: Math.round(110 * mult),
      activities: [
        {
          id: `d${dayNum}-act1`,
          timeSlot: 'morning' as const,
          title: `Iconic Landmark & Historic District Walk`,
          description: `Stroll through historic plazas and iconic architectural monuments in ${destination}.`,
          locationName: `${destination} Historic Center`,
          coordinates: { lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 },
          duration: '2.5 hours',
          estimatedCostUSD: Math.round(20 * mult),
          category: 'sightseeing' as const,
          insiderTip: 'Visit early in the morning to beat the rush and capture optimal lighting.',
          bestTime: '9:00 AM - 11:30 AM',
        },
        {
          id: `d${dayNum}-act2`,
          timeSlot: 'afternoon' as const,
          title: `Artisan Lunch & Museum Exploration`,
          description: `Indulge in authentic local dining followed by world-renowned art and historical exhibits.`,
          locationName: `${destination} Arts Promenade`,
          coordinates: { lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 },
          duration: '3 hours',
          estimatedCostUSD: Math.round(40 * mult),
          category: 'culture' as const,
          insiderTip: 'Book skip-the-line tickets online in advance.',
          bestTime: '1:00 PM - 4:00 PM',
        },
        {
          id: `d${dayNum}-act3`,
          timeSlot: 'evening' as const,
          title: `Sunset Vista & Gourmet Dinner`,
          description: `Enjoy panoramic skyline views followed by a relaxing dinner featuring fresh regional ingredients.`,
          locationName: `${destination} Scenic Lookout`,
          coordinates: { lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 },
          duration: '3 hours',
          estimatedCostUSD: Math.round(50 * mult),
          category: 'food' as const,
          insiderTip: 'Reserve a terrace seat for the best evening city lights.',
          bestTime: '6:30 PM - 9:30 PM',
        },
      ],
    };
  });

  return {
    id: `trip-${Date.now()}`,
    createdAt: new Date().toISOString(),
    destination,
    destinationTagline: `Experience the captivating charm and vibrant culture of ${destination}`,
    coordinates: baseCoords,
    startDate: form.startDate || start.toISOString().split('T')[0],
    endDate: form.endDate || end.toISOString().split('T')[0],
    numberOfDays,
    budgetTier: form.budgetTier,
    travelers: form.travelers,
    vibes: form.vibes && form.vibes.length ? form.vibes : ['Sightseeing', 'Food', 'Culture'],
    overview: `A personalized ${numberOfDays}-day journey to ${destination} tailored for a ${form.travelers} adventure with a ${form.budgetTier} style.`,
    days,
    hotels: [
      {
        id: 'h1',
        name: `${destination} Grand Heritage Boutique Stay`,
        description: `Elegantly designed boutique hotel centrally situated near premier sights and dining.`,
        locationName: `City Center, ${destination}`,
        coordinates: { lat: baseCoords.lat + 0.004, lng: baseCoords.lng - 0.003 },
        pricePerNightUSD: Math.round(160 * mult),
        rating: 4.8,
        priceCategory: form.budgetTier === 'luxury' ? 'Luxury' : form.budgetTier === 'budget' ? 'Budget' : 'Moderate',
        amenities: ['High-speed Wi-Fi', 'Rooftop Lounge', 'Complimentary Breakfast', 'Concierge Desk'],
        bookingTip: 'Ask for a high floor room for the best skyline views.',
      },
      {
        id: 'h2',
        name: `The Sanctuary Garden Suites`,
        description: `Serene stay featuring quiet courtyards and easy transit access to top attractions.`,
        locationName: `Old Quarter, ${destination}`,
        coordinates: { lat: baseCoords.lat - 0.006, lng: baseCoords.lng + 0.005 },
        pricePerNightUSD: Math.round(105 * mult),
        rating: 4.6,
        priceCategory: 'Moderate',
        amenities: ['Eco-friendly Design', 'Garden Café', 'Bicycle Rentals', '24/7 Front Desk'],
        bookingTip: 'Book at least 2 weeks in advance for seasonal promotions.',
      },
    ],
    foodSuggestions: [
      {
        id: 'f1',
        name: `Trattoria Del Local`,
        cuisine: 'Authentic Local Specialties',
        description: 'Charming neighborhood bistro celebrated for authentic family recipes and warm ambience.',
        locationName: `Main Market, ${destination}`,
        coordinates: { lat: baseCoords.lat + 0.002, lng: baseCoords.lng + 0.003 },
        priceRange: '$$',
        mustTryDish: "Chef's Signature Daily Tasting Platter",
        vibe: 'Warm, rustic & lively',
      },
      {
        id: 'f2',
        name: `Skyline Panorama Bistro`,
        cuisine: 'Modern Fusion',
        description: 'Vibrant rooftop terrace offering artisan beverages and creative small plates.',
        locationName: `Tower Promenade, ${destination}`,
        coordinates: { lat: baseCoords.lat - 0.003, lng: baseCoords.lng - 0.004 },
        priceRange: '$$$',
        mustTryDish: 'Seared Specialty Delicacy with Garden Herbs',
        vibe: 'Chic, romantic & scenic',
      },
    ],
    hiddenGems: [
      {
        id: 'g1',
        name: 'Hidden Artisan Courtyard & Tea Room',
        description: `Tucked away behind central alleys, featuring local crafts, quiet tea gardens, and murals.`,
        locationName: `West Quarter, ${destination}`,
        coordinates: { lat: baseCoords.lat + 0.008, lng: baseCoords.lng - 0.007 },
        whySpecial: 'Tranquil pedestrian oasis with virtually no tour groups.',
        bestTimeToVisit: '4:00 PM - 6:00 PM',
      },
      {
        id: 'g2',
        name: 'Sunset Hill Lookout Point',
        description: 'Cobblestone viewpoint overlooking the historic panorama with 360-degree sunset angles.',
        locationName: `North Heights, ${destination}`,
        coordinates: { lat: baseCoords.lat - 0.01, lng: baseCoords.lng + 0.009 },
        whySpecial: 'Breathtaking golden-hour skyline without admission charges.',
        bestTimeToVisit: 'Golden Hour (30 mins before dusk)',
      },
    ],
    budgetBreakdown: {
      accommodationUSD: Math.round(130 * mult * numberOfDays),
      foodAndDiningUSD: Math.round(75 * mult * numberOfDays),
      activitiesAndAttractionsUSD: Math.round(45 * mult * numberOfDays),
      localTransportUSD: Math.round(20 * mult * numberOfDays),
      totalEstimatedUSD: Math.round((130 + 75 + 45 + 20) * mult * numberOfDays),
      budgetTips: [
        'Grab a multi-day metro/transit pass for seamless, cost-effective travel.',
        'Enjoy lunch at neighborhood bistros for the same quality at 40% less cost.',
        'Many iconic museums offer complimentary entry during select weekly hours.',
      ],
    },
    weatherForecast: [
      {
        date: 'Day 1',
        dayName: 'Mon',
        tempC: 22,
        tempF: 72,
        condition: 'Sunny & Clear',
        icon: 'sun',
        humidity: 50,
        windSpeedKmh: 12,
        packingAdvice: 'Breathable clothing, comfortable sneakers, and sunglasses.',
      },
      {
        date: 'Day 2',
        dayName: 'Tue',
        tempC: 24,
        tempF: 75,
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        humidity: 55,
        windSpeedKmh: 10,
        packingAdvice: 'Light daypack, sunscreen, and a light evening layer.',
      },
      {
        date: 'Day 3',
        dayName: 'Wed',
        tempC: 21,
        tempF: 70,
        condition: 'Mild Breeze',
        icon: 'cloud',
        humidity: 60,
        windSpeedKmh: 15,
        packingAdvice: 'Comfortable walking gear and a light jacket.',
      },
    ],
  };
}

export async function generateItinerary(form: TripSearchForm): Promise<ItineraryData> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.destination) {
        return data;
      }
    }
  } catch (error) {
    console.warn('[ItineraryService] Server API unavailable, using offline smart generator:', error);
  }

  // Fallback to local smart generator
  return generateSmartLocalItinerary(form);
}
