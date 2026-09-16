import { httpGetPromise, geocodeCityPromise, promptForCityPromise, ResolvedLocation } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL } from "./types";

// fetches current weather for asynchronously for a given latitude and longitude.
async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const raw = await httpGetPromise(WEATHER_URL(lat, lon));
  return JSON.parse(raw) as WeatherResponse;
}

// fetches news asynchronously.
async function fetchNews(): Promise<NewsResponse> {
  const raw = await httpGetPromise(NEWS_URL);
  return JSON.parse(raw) as NewsResponse;
}


// prints the current weather to the console.
function printWeather(weather: WeatherResponse): void {
  console.log(`[WEATHER] ${weather.current_weather.temperature}°C, wind ${weather.current_weather.windspeed} km/h`);
}

// prints the news headlines to the console.
function printNews(news: NewsResponse): void {
  console.log(`[NEWS] ${news.posts.length} headlines received:`);
  news.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));
}

// runs the weather and news requests sequentially, one after the other.
async function runSequential(location: ResolvedLocation): Promise<void> {
  console.log(`\n[async] Sequential: weather -> news for ${location.name}`);
  try {
    const weather = await fetchWeather(location.latitude, location.longitude);
    printWeather(weather);

    const news = await fetchNews();
    printNews(news);
  } catch (err) {
    console.error("sequential pipeline failed:", (err as Error).message);
  }
}

// runs the weather and news requests simultaneously, waiting for both to finish.
async function runAll(location: ResolvedLocation): Promise<void> {
  console.log(`\n[async] Promise.all(): weather + news simultaneously`);
  const start = Date.now();
  try {
    const [weather, news] = await Promise.all([
      fetchWeather(location.latitude, location.longitude),
      fetchNews(),
    ]);
    console.log(`Both resolved in ${Date.now() - start}ms`);
    printWeather(weather);
    printNews(news);
  } catch (err) {
    console.error("Promise.all failed (one request rejected):", (err as Error).message);
  }
}
 
// runs the weather and news requests simultaneously, but only waits for the first one to finish.
async function runRace(location: ResolvedLocation): Promise<void> {
  console.log(`\n[async] Promise.race(): whichever of weather/news answers first`);
  const start = Date.now();
  try {
    const winner = await Promise.race([
      fetchWeather(location.latitude, location.longitude).then((w) => ({
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

// prompts the user for a city name, geocodes it to get latitude and longitude, and then runs the three different request pipelines.
async function main(): Promise<void> {
  const cityName = await promptForCityPromise();
  if (!cityName) {
    console.error("No city entered — please try again and type a name.");
    return;
  }

  console.log(`[async] Looking up "${cityName}"...`);
  let location: ResolvedLocation;
  try {
    location = await geocodeCityPromise(cityName);
  } catch (err) {
    console.error("[LOCATION]", (err as Error).message);
    return;
  }

  // Runs dinstict pipelines to demonstrate different async patterns.
  await runSequential(location);
  await runAll(location);
  await runRace(location);
}

main();
