import { httpGetCallback } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL, DEFAULT_LOCATION } from "./types";


// Fetches weather data using a callback pattern
function fetchWeatherCallback(
  lat: number,
  lon: number,
  callback: (err: Error | null, data?: WeatherResponse) => void
): void {
  httpGetCallback(WEATHER_URL(lat, lon), (err, raw) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(raw as string) as WeatherResponse);
    } catch (parseErr) {
      callback(parseErr as Error);
    }
  });
}

function run(): void {
  console.log(`\n[callback] Fetching weather for ${DEFAULT_LOCATION.name}...`);

  // Nested sequential calls this pyramid shape is "callback hell
  fetchWeatherCallback(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, (weatherErr, weather) => {
    if (weatherErr) {
      console.error("[WEATHER]", weatherErr.message);
      return;
    }

    console.log(`✓ [WEATHER] ${weather!.current_weather.temperature}°C, wind ${weather!.current_weather.windspeed} km/h`);
    console.log("[callback] Weather done, now fetching news (nested)...");

    fetchNewsCallback((newsErr, news) => {
      if (newsErr) {
        console.error("[NEWS]", newsErr.message);
        return;
      }

      console.log(`[NEWS] ${news!.posts.length} headlines received:`);
      news!.posts.forEach((post, i) => console.log(`   ${i + 1}. ${post.title}`));

      // A third, further-nested step to make the pyramid unmistakable.
      console.log("[callback] Done. Notice the indentation — that's callback hell.");
    });
  });
}

run();