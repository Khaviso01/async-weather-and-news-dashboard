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

function printWeather(weather: WeatherResponse): void {
  console.log(`✓ [WEATHER] ${weather.current_weather.temperature}°C, wind ${weather.current_weather.windspeed} km/h`);
}

function printNews(news: NewsResponse): void {
  console.log(`✓ [NEWS] ${news.posts.length} headlines received:`);
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}