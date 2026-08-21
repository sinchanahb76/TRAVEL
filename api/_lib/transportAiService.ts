import { GoogleGenAI } from '@google/genai';
import { resolveIataCode } from './flightService.js';

export interface ParsedTransportQuery {
  mode: 'flight';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'one-way' | 'round-trip';
  passengers: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  explanation: string;
}

export interface TransportRecommendation {
  destination: string;
  origin?: string;
  recommendedMode: 'flight' | 'train' | 'rental';
  headline: string;
  reasoning: string;
  estimatedFlightDuration: string;
  estimatedFlightCostUSD: number;
  tips: string[];
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Parse free-form natural language query into structured flight search params
export async function parseNaturalLanguageTransportQuery(prompt: string): Promise<ParsedTransportQuery> {
  const defaultDeparture = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  if (!prompt || prompt.trim() === '') {
    return {
      mode: 'flight',
      origin: 'New York',
      destination: 'London',
      departureDate: defaultDeparture,
      tripType: 'one-way',
      passengers: 1,
      cabinClass: 'ECONOMY',
      explanation: 'Default flight search query generated.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return basicRegexTransportParser(prompt, defaultDeparture);
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are a travel assistant extracting structured flight search parameters from a user prompt.
Extract:
- mode: "flight"
- origin: string (city or airport name)
- destination: string (city or airport name)
- departureDate: YYYY-MM-DD (if relative like "tomorrow", "next Friday", "in 2 days", calculate from today: ${new Date().toISOString().split('T')[0]})
- returnDate?: YYYY-MM-DD (if round trip mentioned)
- tripType: "one-way" | "round-trip"
- passengers: number (default 1)
- cabinClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST" (default "ECONOMY")
- explanation: brief 1-sentence explanation of what you extracted.

Respond strictly in JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Prompt: "${prompt}"` }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text?.trim() || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      mode: 'flight',
      origin: parsed.origin || 'New Delhi',
      destination: parsed.destination || 'Bangalore',
      departureDate: parsed.departureDate || defaultDeparture,
      returnDate: parsed.returnDate,
      tripType: parsed.tripType || (parsed.returnDate ? 'round-trip' : 'one-way'),
      passengers: parsed.passengers ? Math.max(1, Number(parsed.passengers)) : 1,
      cabinClass: parsed.cabinClass || 'ECONOMY',
      explanation: parsed.explanation || `Parsed search from "${prompt}"`,
    };
  } catch (err: any) {
    console.warn('Gemini transport parse fallback triggered:', err?.message || err);
    return basicRegexTransportParser(prompt, defaultDeparture);
  }
}

// Recommend transportation for an itinerary destination
export async function getTransportRecommendations(destination: string, origin?: string): Promise<TransportRecommendation> {
  const cleanDest = (destination || '').trim();
  const cleanOrigin = (origin || '').trim();

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackTransportRecommendation(cleanDest, cleanOrigin);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Provide practical transportation flight and arrival recommendations for travelers traveling to "${cleanDest}" ${cleanOrigin ? `from "${cleanOrigin}"` : ''}.
Return a JSON object with:
- recommendedMode: "flight" | "train" | "rental"
- headline: short catchy headline (e.g. "Direct 2-hour flight connecting into central hub")
- reasoning: 2-3 sentences explaining airport connectivity and flight route options
- estimatedFlightDuration: string (e.g. "2h 15m")
- estimatedFlightCostUSD: number (e.g. 75)
- tips: array of 3 bullet tips for transit and flight booking to this destination.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);

    return {
      destination: cleanDest,
      origin: cleanOrigin,
      recommendedMode: data.recommendedMode || 'flight',
      headline: data.headline || `Travel to ${cleanDest}`,
      reasoning: data.reasoning || `Fast flights connect travelers to ${cleanDest} through nearby major airports.`,
      estimatedFlightDuration: data.estimatedFlightDuration || '2h 30m',
      estimatedFlightCostUSD: data.estimatedFlightCostUSD || 85,
      tips: data.tips || [
        'Book flights 2-3 weeks in advance for best fares.',
        'Arrive 2 hours early for domestic flights and 3 hours for international.',
        'Check airport transfer options before arrival for seamless travel.',
      ],
    };
  } catch (err: any) {
    console.warn('Gemini transport recommendation fallback:', err?.message || err);
    return generateFallbackTransportRecommendation(cleanDest, cleanOrigin);
  }
}

function basicRegexTransportParser(prompt: string, defaultDate: string): ParsedTransportQuery {
  const isRound = /\b(round\s*trip|return|both\s*ways)\b/i.test(prompt);
  const isBusiness = /\b(business|first\s*class)\b/i.test(prompt);

  // Extract from ... to ...
  const fromToMatch = prompt.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s+(?:on|next|this|for|in|tomorrow)|\s*$)/i);
  let origin = 'New Delhi';
  let destination = 'Goa';

  if (fromToMatch) {
    origin = fromToMatch[1].trim();
    destination = fromToMatch[2].trim();
  }

  return {
    mode: 'flight',
    origin,
    destination,
    departureDate: defaultDate,
    tripType: isRound ? 'round-trip' : 'one-way',
    passengers: 1,
    cabinClass: isBusiness ? 'BUSINESS' : 'ECONOMY',
    explanation: `Extracted flight route from "${prompt}"`,
  };
}

function generateFallbackTransportRecommendation(destination: string, origin?: string): TransportRecommendation {
  return {
    destination,
    origin,
    recommendedMode: 'flight',
    headline: `Connecting to ${destination}`,
    reasoning: `Direct and 1-stop flights operate regularly into ${destination} from major international and domestic hubs.`,
    estimatedFlightDuration: '2h 15m',
    estimatedFlightCostUSD: 85,
    tips: [
      'Search flights early to lock in lowest airline fares.',
      'Check baggage allowances across different fare tiers.',
      'Plan airport transfers in advance for a hassle-free trip.',
    ],
  };
}

