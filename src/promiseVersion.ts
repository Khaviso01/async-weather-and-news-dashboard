import { httpGetPromise, geocodeCityPromise, promptForCityPromise, ResolvedLocation } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL } from "./types";


// Fetches weather data for a given latitude and longitude, returning a promise that resolves to a WeatherResponse.
function fetchWeatherPromise(lat: number, lon: number): Promise<WeatherResponse> {
  return httpGetPromise(WEATHER_URL(lat, lon)).then((raw) => JSON.parse(raw) as WeatherResponse);
}

// Fetches news data, returning a promise that resolves to a NewsResponse.
function fetchNewsPromise(): Promise<NewsResponse> {
  return httpGetPromise(NEWS_URL).then((raw) => JSON.parse(raw) as NewsResponse);
}

// Logs formatted weather information.
function printWeather(weather: WeatherResponse): void {
  console.log(`✓ [WEATHER] ${weather.current_weather.temperature}°C, wind ${weather.current_weather.windspeed} km/h`);
}

// Logs numbered news headlines.
function printNews(news: NewsResponse): void {
  console.log(`✓ [NEWS] ${news.posts.length} headlines received:`);
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}

// Chained promises  that fetch weather, then fetch news, handling errors in a single catch.
function runChained(location: ResolvedLocation): Promise<void> {
  console.log(`\n[promise] Chained: weather -> news for ${location.name}`);
  return fetchWeatherPromise(location.latitude, location.longitude)
    .then((weather) => {
      printWeather(weather);
      return fetchNewsPromise();
    })
    .then((news) => printNews(news))
    .catch((err: Error) => console.error("✗ chained pipeline failed:", err.message));
}

// Promise.all() both requests fire simultaneously, we wait for both.
function runAll(location: ResolvedLocation): Promise<void> {
  console.log(`\n[promise] Promise.all(): weather + news simultaneously`);
  const start = Date.now();
  return Promise.all([
    fetchWeatherPromise(location.latitude, location.longitude),
    fetchNewsPromise(),
  ])
    .then(([weather, news]) => {
      console.log(`Both resolved in ${Date.now() - start}ms`);
      printWeather(weather);
      printNews(news);
    })
    .catch((err: Error) => console.error("Promise.all failed (one request rejected):", err.message));
}

// Competes races against each other.
function runRace(location: ResolvedLocation): Promise<void> {
  console.log(`\n[promise] Promise.race(): whichever of weather/news answers first`);
  const start = Date.now();
  return Promise.race([
    fetchWeatherPromise(location.latitude, location.longitude).then((w) => ({
      type: "weather" as const,
      data: w,
    })),
    fetchNewsPromise().then((n) => ({ type: "news" as const, data: n })),
  ])
    .then((winner) => {
      console.log(`✓ "${winner.type}" won the race in ${Date.now() - start}ms`);
    })
    .catch((err: Error) => console.error("✗ Promise.race failed:", err.message));
}


// Coordinator using async for looking
async function run(): Promise<void> {
  const cityName = await promptForCityPromise();
  if (!cityName) {
    console.error("No city entered — please try again and type a name.");
    return;
  }

  console.log(`[promise] Looking up "${cityName}"...`);
  let location: ResolvedLocation;
  try {
    location = await geocodeCityPromise(cityName);
  } catch (err) {
    console.error("[LOCATION]", (err as Error).message);
    return;
  }


  // Running the 3 promises
  await runChained(location);
  await runAll(location);
  await runRace(location);
}

run();
