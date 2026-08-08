// API service helper module for Gemini and OpenWeather integrations

export function getGeminiApiKey(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv.VITE_GEMINI_API_KEY) return metaEnv.VITE_GEMINI_API_KEY;
    if (metaEnv.GEMINI_API_KEY) return metaEnv.GEMINI_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  }
  return '';
}

export function getOpenWeatherApiKey(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv.VITE_OPENWEATHER_API_KEY) return metaEnv.VITE_OPENWEATHER_API_KEY;
    if (metaEnv.OPENWEATHER_API_KEY) return metaEnv.OPENWEATHER_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_OPENWEATHER_API_KEY) return process.env.VITE_OPENWEATHER_API_KEY;
    if (process.env.OPENWEATHER_API_KEY) return process.env.OPENWEATHER_API_KEY;
  }
  return '';
}

export async function fetchWeatherForecast(destination: string) {
  const apiKey = getOpenWeatherApiKey();
  if (apiKey && destination) {
    try {
      const owRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          destination
        )}&units=metric&appid=${apiKey}`
      );
      if (owRes.ok) {
        return await owRes.json();
      }
    } catch (e) {
      console.warn('Direct OpenWeather API fetch failed, falling back to server proxy:', e);
    }
  }

  // Fall back to server weather route
  try {
    const res = await fetch(`/api/weather?destination=${encodeURIComponent(destination)}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
    }
  } catch (e) {
    console.warn('Server weather fetch failed:', e);
  }

  return { success: true, simulated: true, destination };
}
