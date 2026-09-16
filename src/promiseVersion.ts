import { httpGetPromise } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL, DEFAULT_LOCATION } from "./types";

// Converting weather response into JavaScript object
function fetchWeatherPromise(lat: number, lon: number): Promise<WeatherResponse> {
    return httpGetPromise(WEATHER_URL(lat, lon)).then((raw) => JASON.parse(raw) as WeatherResponse);
}

function fetchNewsPromise(): Promise<NewsResponse> {
  return httpGetPromise(NEWS_URL).then((raw) => JSON.parse(raw) as NewsResponse);
}

function printWeather(weather: WeatherResponse): void {
  console.log(`[WEATHER] ${weather.current_weather.temperature}°C, wind ${weather.current_weather.windspeed} km/h`);
}

function printNews(news: NewsResponse): void {
  console.log(`[NEWS] ${news.posts.length} headlines received:`);
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}

// 
function runChained(): Promise<void> {
  console.log(`\n[promise] Chained: weather -> news for ${DEFAULT_LOCATION.name}`);
  return fetchWeatherPromise(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude)
    .then((weather) => {
      printWeather(weather);
      return fetchNewsPromise();
    })
    .then((news) => printNews(news))
    .catch((err: Error) => console.error("✗ chained pipeline failed:", err.message));
}

function runAll(): Promise<void> {
  console.log(`\n[promise] Promise.all(): weather + news simultaneously`);
  const start = Date.now();
  return Promise.all([
    fetchWeatherPromise(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude),
    fetchNewsPromise(),
  ])
    .then(([weather, news]) => {
      console.log(`✓ Both resolved in ${Date.now() - start}ms`);
      printWeather(weather);
      printNews(news);
    })
    .catch((err: Error) => console.error("✗ Promise.all failed (one request rejected):", err.message));
}