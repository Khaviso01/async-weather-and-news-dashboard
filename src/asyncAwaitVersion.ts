import { httpGetPromise } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL, DEFAULT_LOCATION } from "./types";

// Async function to fetch data from URL
async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const raw = await httpGetPromise(WEATHER_URL(lat, lon));
  return JSON.parse(raw) as WeatherResponse;
}

async function fetchNews(): Promise<NewsResponse> {
  const raw = await httpGetPromise(NEWS_URL);
  return JSON.parse(raw) as NewsResponse;
}

