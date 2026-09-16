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
  console.log(`[WEATHER] ${weather.current_weather.temperature}°C, wind ${weather.current_weather.windspeed} km/h`);
}

function printNews(news: NewsResponse): void {
  console.log(`[NEWS] ${news.posts.length} headlines received:`);
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}

// 
async function runSequential(): Promise<void> {
  console.log(`\n[async] Sequential: weather -> news for ${DEFAULT_LOCATION.name}`);
  try {
    const weather = await fetchWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    printWeather(weather);

    const news = await fetchNews();
    printNews(news);
  } catch (err) {
    console.error("sequential pipeline failed:", (err as Error).message);
  }
}

// Promise.race() awaited , first settled result wins.
async function runAll(): Promise<void> {
  console.log(`\n[async] Promise.all(): weather + news simultaneously`);
  const start = Date.now();
  try {
    const [weather, news] = await Promise.all([
      fetchWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude),
      fetchNews(),
    ]);
    console.log(`Both resolved in ${Date.now() - start}ms`);
    printWeather(weather);
    printNews(news);
  } catch (err) {
    console.error("Promise.all failed (one request rejected):", (err as Error).message);
  }
}

// Promise.race() awaited, first settled result wins.
async function runRace(): Promise<void> {
  console.log(`\n[async] Promise.race(): whichever of weather/news answers first`);
  const start = Date.now();
  try {
    const winner = await Promise.race([
      fetchWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude).then((w) => ({
        type: "weather" as const,
        data: w,
      })),
      fetchNews().then((n) => ({ type: "news" as const, data: n })),
    ]);
    console.log(`"${winner.type}" won the race in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Promise.race failed:", (err as Error).message);
  }
}

async function main(): Promise<void> {
  await runSequential();
  await runAll();
  await runRace();
}

main();
