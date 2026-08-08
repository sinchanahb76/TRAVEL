import { GoogleGenAI } from "@google/genai";
import { MongoClient, Db } from "mongodb";

// Global in-memory store fallback when MongoDB is not connected
let savedTripsStore: any[] = [];

// MongoDB Connection Caching for Vercel Serverless environment
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === "") return null;

  if (cachedDb) return cachedDb;

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }
    cachedDb = cachedClient.db("travel_app");
    return cachedDb;
  } catch (err) {
    console.error("Failed to connect to MongoDB, falling back to memory store:", err);
    return null;
  }
}

// Initialize Gemini Client
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback itinerary generator for smooth UX
export function generateFallbackItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  budgetTier: string,
  travelers: string,
  vibes: string[]
) {
  const start = new Date(startDate || Date.now());
  const end = new Date(endDate || Date.now() + 3 * 86400000);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const numberOfDays = Math.max(1, Math.min(14, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));

  const coordMap: Record<string, { lat: number; lng: number }> = {
    kyoto: { lat: 35.0116, lng: 135.7681 },
    paris: { lat: 48.8566, lng: 2.3522 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    rome: { lat: 41.9028, lng: 12.4964 },
    bali: { lat: -8.4095, lng: 115.1889 },
    "new york": { lat: 40.7128, lng: -74.006 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    london: { lat: 51.5074, lng: -0.1278 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    sydney: { lat: -33.8688, lng: 151.2093 },
  };

  const cleanDest = destination.trim().toLowerCase();
  let baseCoords = { lat: 35.6762, lng: 139.6503 };
  for (const k of Object.keys(coordMap)) {
    if (cleanDest.includes(k)) {
      baseCoords = coordMap[k];
      break;
    }
  }

  const mult = budgetTier === "luxury" ? 2.5 : budgetTier === "moderate" ? 1.4 : 0.8;

  const days = Array.from({ length: numberOfDays }, (_, i) => {
    const dayNum = i + 1;
    const dayDate = new Date(start.getTime() + i * 86400000);
    const dateStr = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      dayNumber: dayNum,
      dateStr,
      title: `Day ${dayNum}: Exploring ${destination}'s Iconic Culture & Flavors`,
      summary: `A curated blend of landmark sights, local culinary stops, and relaxing atmospheres in ${destination}.`,
      dailyBudgetEstimateUSD: Math.round(120 * mult),
      activities: [
        {
          id: `d${dayNum}-act1`,
          timeSlot: "morning",
          title: `Morning Heritage & City Walk at ${destination} Central Landmark`,
          description: `Kick start your day exploring the historic streets and vibrant early morning markets of ${destination}.`,
          locationName: `${destination} City Center`,
          coordinates: { lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 },
          duration: "2.5 hours",
          estimatedCostUSD: Math.round(25 * mult),
          category: "sightseeing",
          insiderTip: "Arrive before 9 AM to avoid the tour crowds and enjoy golden hour photos.",
          bestTime: "8:30 AM - 11:00 AM",
        },
        {
          id: `d${dayNum}-act2`,
          timeSlot: "afternoon",
          title: `Artisanal Lunch & Cultural Immersion`,
          description: `Savor authentic regional dishes followed by a guided tour through local craft workshops and galleries.`,
          locationName: `${destination} Arts Quarter`,
          coordinates: { lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 },
          duration: "3 hours",
          estimatedCostUSD: Math.round(45 * mult),
          category: "culture",
          insiderTip: "Try the house specialty and ask the chef for local recommendations.",
          bestTime: "12:30 PM - 3:30 PM",
        },
        {
          id: `d${dayNum}-act3`,
          timeSlot: "evening",
          title: `Sunset Viewpoint & Gourmet Dinner`,
          description: `End the evening at a scenic panorama spot followed by a cozy dinner featuring fresh local produce and music.`,
          locationName: `${destination} Panorama Ridge`,
          coordinates: { lat: baseCoords.lat + (Math.random() - 0.5) * 0.02, lng: baseCoords.lng + (Math.random() - 0.5) * 0.02 },
          duration: "3 hours",
          estimatedCostUSD: Math.round(50 * mult),
          category: "food",
          insiderTip: "Book a window table 30 minutes before sunset.",
          bestTime: "6:30 PM - 9:30 PM",
        },
      ],
    };
  });

  return {
    id: `trip-${Date.now()}`,
    createdAt: new Date().toISOString(),
    destination,
    destinationTagline: `Discover the unforgettable soul and magic of ${destination}`,
    coordinates: baseCoords,
    startDate,
    endDate,
    numberOfDays,
    budgetTier,
    travelers,
    vibes: vibes && vibes.length > 0 ? vibes : ["Culture", "Food", "Sightseeing"],
    overview: `This customized ${numberOfDays}-day trip to ${destination} is designed for ${travelers} seeking a ${budgetTier} experience filled with ${(vibes || []).join(", ")}. Enjoy carefully timed daily itineraries, authentic dining recommendations, and top-tier accommodations.`,
    days,
    hotels: [
      {
        id: "h1",
        name: `${destination} Grand Heritage Hotel & Spa`,
        description: `Boutique luxury hotel located in the heart of ${destination} with panoramic city views and authentic service.`,
        locationName: `Central District, ${destination}`,
        coordinates: { lat: baseCoords.lat + 0.005, lng: baseCoords.lng - 0.003 },
        pricePerNightUSD: Math.round(180 * mult),
        rating: 4.8,
        priceCategory: budgetTier === "luxury" ? "Luxury" : budgetTier === "budget" ? "Budget" : "Moderate",
        amenities: ["Free High-Speed Wi-Fi", "Infinity Pool", "Rooftop Lounge", "Breakfast Included", "Spa & Sauna"],
        bookingTip: "Ask for a high floor room facing the historic square.",
      },
      {
        id: "h2",
        name: `The Sanctuary Oasis ${destination}`,
        description: "Cozy eco-friendly boutique stay offering tranquil gardens and easy access to top attractions.",
        locationName: `Old Town Edge, ${destination}`,
        coordinates: { lat: baseCoords.lat - 0.008, lng: baseCoords.lng + 0.006 },
        pricePerNightUSD: Math.round(110 * mult),
        rating: 4.6,
        priceCategory: "Moderate",
        amenities: ["Free Bike Rentals", "Organic Breakfast", "Quiet Garden Courtyard", "Airport Shuttle"],
        bookingTip: "Complimentary evening wine and tea tasting hosted daily.",
      },
    ],
    foodSuggestions: [
      {
        id: "f1",
        name: `Café De Local ${destination}`,
        cuisine: "Authentic Regional",
        description: "Family-run bistro known for generations-old recipes and warm hospitality.",
        locationName: `Market Square, ${destination}`,
        coordinates: { lat: baseCoords.lat + 0.003, lng: baseCoords.lng + 0.004 },
        priceRange: "$$",
        mustTryDish: "Chef's Signature Tasting Platter",
        vibe: "Warm, authentic & historic",
      },
      {
        id: "f2",
        name: `Skyline Tapas & Cocktail Bar`,
        cuisine: "Modern Fusion",
        description: "Vibrant rooftop lounge with craft beverages and seasonal small bites.",
        locationName: `Tower Promenade, ${destination}`,
        coordinates: { lat: baseCoords.lat - 0.004, lng: baseCoords.lng - 0.005 },
        priceRange: "$$$",
        mustTryDish: "Smoked Local Delicacies",
        vibe: "Chic, lively & romantic",
      },
    ],
    hiddenGems: [
      {
        id: "g1",
        name: "Secret Courtyard Garden & Artisan Alley",
        description: `Tucked away behind main thoroughfares, this alleyway features local painters, craftsmen, and quiet tea rooms in ${destination}.`,
        locationName: `West District, ${destination}`,
        coordinates: { lat: baseCoords.lat + 0.012, lng: baseCoords.lng - 0.01 },
        whySpecial: "Completely pedestrian-friendly and virtually unknown to big tour groups.",
        bestTimeToVisit: "Late afternoon around 4 PM",
      },
      {
        id: "g2",
        name: "Old Bell Tower Panorama Hill",
        description: "A short gentle walk up a cobblestone hill leading to the best unobstructed sunset views of the skyline.",
        locationName: `North Heights, ${destination}`,
        coordinates: { lat: baseCoords.lat - 0.015, lng: baseCoords.lng + 0.012 },
        whySpecial: "Breathtaking 360-degree views without admission fees.",
        bestTimeToVisit: "Golden Hour (30 mins before sunset)",
      },
    ],
    budgetBreakdown: {
      accommodationUSD: Math.round(140 * mult * numberOfDays),
      foodAndDiningUSD: Math.round(80 * mult * numberOfDays),
      activitiesAndAttractionsUSD: Math.round(50 * mult * numberOfDays),
      localTransportUSD: Math.round(25 * mult * numberOfDays),
      totalEstimatedUSD: Math.round((140 + 80 + 50 + 25) * mult * numberOfDays),
      budgetTips: [
        "Purchase a multi-day city transport pass for unlimited rides on buses and trains.",
        "Eat lunch at local market stalls for 40% savings compared to tourist square restaurants.",
        "Many top museums offer free admission on the first Sunday of the month.",
      ],
    },
    weatherForecast: Array.from({ length: Math.min(numberOfDays, 5) }, (_, idx) => {
      const d = new Date(start.getTime() + idx * 86400000);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const conditions = ["Sunny", "Partly Cloudy", "Mild breeze", "Clear Sky"];
      const cond = conditions[idx % conditions.length];
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayName: dayNames[d.getDay()],
        tempC: 22 + (idx % 3),
        tempF: Math.round((22 + (idx % 3)) * 1.8 + 32),
        condition: cond,
        icon: idx % 2 === 0 ? "sun" : "cloud-sun",
        humidity: 55 + idx * 2,
        windSpeedKmh: 12 + idx,
        packingAdvice: "Light breathable clothing, comfortable walking shoes, and sunglasses recommended.",
      };
    }),
  };
}

// Generate Itinerary Core Logic
export async function handleGenerateItinerary(body: any) {
  const payload = typeof body === "string" ? JSON.parse(body) : (body || {});
  const { destination, startDate, endDate, budgetTier, travelers, vibes, customPreferences } = payload;

  if (!destination) {
    throw new Error("Destination is required.");
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("No custom Gemini API key configured. Utilizing smart trip generator.");
    return generateFallbackItinerary(destination, startDate, endDate, budgetTier, travelers, vibes);
  }

  const ai = getGeminiClient();

  const prompt = `You are a world-class travel guide and itinerary expert.
Generate a detailed, personalized travel itinerary for a trip to "${destination}".
Trip Details:
- Start Date: ${startDate || "Upcoming"}
- End Date: ${endDate || "Upcoming"}
- Budget Level: ${budgetTier || "moderate"}
- Travelers: ${travelers || "couple"}
- Preferences/Vibes: ${vibes && vibes.length ? vibes.join(", ") : "Culture, Food, Sights"}
- Custom Requests: ${customPreferences || "None"}

CRITICAL REQUIREMENTS:
1. Provide realistic latitude and longitude coordinates for ${destination} and for each activity, hotel, food spot, and hidden gem.
2. Return ONLY valid JSON matching this exact structure:
{
  "destination": string,
  "destinationTagline": string,
  "coordinates": { "lat": number, "lng": number },
  "startDate": string,
  "endDate": string,
  "numberOfDays": number,
  "budgetTier": string,
  "travelers": string,
  "vibes": string[],
  "overview": string,
  "days": [
    {
      "dayNumber": number,
      "dateStr": string,
      "title": string,
      "summary": string,
      "dailyBudgetEstimateUSD": number,
      "activities": [
        {
          "id": string,
          "timeSlot": "morning" | "afternoon" | "evening",
          "title": string,
          "description": string,
          "locationName": string,
          "coordinates": { "lat": number, "lng": number },
          "duration": string,
          "estimatedCostUSD": number,
          "category": "sightseeing" | "food" | "culture" | "adventure" | "relaxation" | "shopping" | "nature" | "nightlife",
          "insiderTip": string,
          "bestTime": string
        }
      ]
    }
  ],
  "hotels": [
    {
      "id": string,
      "name": string,
      "description": string,
      "locationName": string,
      "coordinates": { "lat": number, "lng": number },
      "pricePerNightUSD": number,
      "rating": number,
      "priceCategory": "Budget" | "Moderate" | "Luxury",
      "amenities": string[],
      "bookingTip": string
    }
  ],
  "foodSuggestions": [
    {
      "id": string,
      "name": string,
      "cuisine": string,
      "description": string,
      "locationName": string,
      "coordinates": { "lat": number, "lng": number },
      "priceRange": "$" | "$$" | "$$$" | "$$$$",
      "mustTryDish": string,
      "vibe": string
    }
  ],
  "hiddenGems": [
    {
      "id": string,
      "name": string,
      "description": string,
      "locationName": string,
      "coordinates": { "lat": number, "lng": number },
      "whySpecial": string,
      "bestTimeToVisit": string
    }
  ],
  "budgetBreakdown": {
    "accommodationUSD": number,
    "foodAndDiningUSD": number,
    "activitiesAndAttractionsUSD": number,
    "localTransportUSD": number,
    "totalEstimatedUSD": number,
    "budgetTips": string[]
  },
  "weatherForecast": [
    {
      "date": string,
      "dayName": string,
      "tempC": number,
      "tempF": number,
      "condition": string,
      "icon": "sun" | "cloud-sun" | "cloud" | "rain" | "thunder" | "snow",
      "humidity": number,
      "windSpeedKmh": number,
      "packingAdvice": string
    }
  ]
}`;

  let responseText = "";
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      responseText = response.text || "";
      break;
    } catch (err: any) {
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        String(err?.message || "").includes("503") ||
        String(err?.message || "").includes("high demand") ||
        String(err?.message || "").includes("UNAVAILABLE");

      if (isTransient && attempts < maxAttempts) {
        const delayMs = attempts * 1000;
        console.warn(`Gemini 503 high demand spike, retrying in ${delayMs}ms (attempt ${attempts}/${maxAttempts})...`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(responseText);
  } catch (parseErr) {
    console.warn("JSON parse error from Gemini output, falling back to smart generator:", parseErr);
    parsed = generateFallbackItinerary(destination, startDate, endDate, budgetTier, travelers, vibes);
  }

  if (!parsed.id) {
    parsed.id = `trip-${Date.now()}`;
  }
  if (!parsed.createdAt) {
    parsed.createdAt = new Date().toISOString();
  }

  return parsed;
}

// Get Saved Trips Handler
export async function getTripsHandler() {
  const db = await getMongoDb();
  if (db) {
    try {
      const trips = await db.collection("trips").find({}).sort({ createdAt: -1 }).toArray();
      // Remove mongo _id for clean response
      const cleanTrips = trips.map(({ _id, ...rest }) => rest);
      return { trips: cleanTrips };
    } catch (err) {
      console.error("MongoDB getTrips error:", err);
    }
  }
  return { trips: savedTripsStore };
}

// Save Trip Handler
export async function saveTripHandler(tripInput: any) {
  const trip = typeof tripInput === "string" ? JSON.parse(tripInput) : tripInput;
  if (!trip || !trip.id) {
    throw new Error("Invalid trip payload");
  }

  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection("trips").updateOne({ id: trip.id }, { $set: trip }, { upsert: true });
    } catch (err) {
      console.error("MongoDB saveTrip error:", err);
    }
  }

  // Update in-memory fallback store as well
  const existingIdx = savedTripsStore.findIndex((t) => t.id === trip.id);
  if (existingIdx >= 0) {
    savedTripsStore[existingIdx] = trip;
  } else {
    savedTripsStore.unshift(trip);
  }

  return { success: true, trip, count: savedTripsStore.length };
}

// Delete Trip Handler
export async function deleteTripHandler(id: string) {
  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection("trips").deleteOne({ id });
    } catch (err) {
      console.error("MongoDB deleteTrip error:", err);
    }
  }

  savedTripsStore = savedTripsStore.filter((t) => t.id !== id);
  return { success: true, count: savedTripsStore.length };
}

// Weather Forecast Proxy Handler
export async function getWeatherHandler(destination: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY;

  if (apiKey && destination) {
    try {
      const owRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          String(destination)
        )}&units=metric&appid=${apiKey}`
      );
      if (owRes.ok) {
        const data = await owRes.json();
        return { success: true, data };
      }
    } catch (e) {
      console.warn("OpenWeather API call failed, returning simulated weather.");
    }
  }

  return {
    success: true,
    simulated: true,
    destination: destination || "Selected City",
  };
}
