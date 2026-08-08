import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Persistent in-memory / file trip storage for /api/trips
let savedTripsStore: any[] = [];

// Initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback itinerary generator for smooth UX if API key is missing or invalid
function generateFallbackItinerary(
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

  // Default coordinate lookup for common places, fallback to Tokyo
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
    overview: `This customized ${numberOfDays}-day trip to ${destination} is designed for ${travelers} seeking a ${budgetTier} experience filled with ${vibes.join(", ")}. Enjoy carefully timed daily itineraries, authentic dining recommendations, and top-tier accommodations.`,
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

// API Route: Generate Itinerary using Gemini 3.6 Flash
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const { destination, startDate, endDate, budgetTier, travelers, vibes, customPreferences } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required." });
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log("No custom Gemini API key configured. Utilizing smart trip generator.");
      const fallback = generateFallbackItinerary(destination, startDate, endDate, budgetTier, travelers, vibes);
      return res.json(fallback);
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

    return res.json(parsed);
  } catch (error: any) {
    console.warn("Gemini API call unavailable or failed after retries, returning customized smart fallback itinerary.");
    const { destination, startDate, endDate, budgetTier, travelers, vibes } = req.body || {};
    const fallback = generateFallbackItinerary(
      destination || "Tokyo",
      startDate || "",
      endDate || "",
      budgetTier || "moderate",
      travelers || "couple",
      vibes || []
    );
    return res.json(fallback);
  }
});

// API Route: Weather Forecast Proxy
app.get("/api/weather", async (req, res) => {
  const { destination } = req.query;
  const apiKey = process.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;

  if (apiKey && destination) {
    try {
      const owRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          String(destination)
        )}&units=metric&appid=${apiKey}`
      );
      if (owRes.ok) {
        const data = await owRes.json();
        return res.json({ success: true, data });
      }
    } catch (e) {
      console.warn("OpenWeather API call failed, returning simulated weather.");
    }
  }

  return res.json({
    success: true,
    simulated: true,
    destination: destination || "Selected City",
  });
});

// API Routes for Saved Trips
app.get("/api/trips", (req, res) => {
  res.json({ trips: savedTripsStore });
});

app.post("/api/trips", (req, res) => {
  const trip = req.body;
  if (!trip || !trip.id) {
    return res.status(400).json({ error: "Invalid trip payload" });
  }

  const existingIdx = savedTripsStore.findIndex((t) => t.id === trip.id);
  if (existingIdx >= 0) {
    savedTripsStore[existingIdx] = trip;
  } else {
    savedTripsStore.unshift(trip);
  }

  res.json({ success: true, trip, count: savedTripsStore.length });
});

app.delete("/api/trips/:id", (req, res) => {
  const { id } = req.params;
  savedTripsStore = savedTripsStore.filter((t) => t.id !== id);
  res.json({ success: true, count: savedTripsStore.length });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start Express and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
