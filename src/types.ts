// type definitions used by all three async implementations

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  current_weather: CurrentWeather;
}

export interface NewsPost {
  id: number;
  title: string;
  tags: string[];
  reactions: { likes: number; dislikes: number } | number;
}

export interface NewsResponse {
  posts: NewsPost[];
  total: number;
}

// Default location used when the user doesn't enter a city name for testing purposes. Polokwane, Limpopo, South Africa.
export const DEFAULT_LOCATION = {
  name: "Polokwane, Limpopo",
  latitude: -23.9045,
  longitude: 29.4689,
};

export const WEATHER_URL = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

export const NEWS_URL = "https://dummyjson.com/posts?limit=5";

export const GEOCODE_URL = (cityName: string) =>
  `https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(cityName)}`;

// A normalized error shape so every version reports failures the same way.
export interface AppError {
  source: "weather" | "news";
  message: string;
}

export function formatError(err: AppError): string {
  return `✗ [${err.source.toUpperCase()}] ${err.message}`;
}
