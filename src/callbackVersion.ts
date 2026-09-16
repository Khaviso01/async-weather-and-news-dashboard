import { httpGetCallback, geocodeCityCallback, promptForCityCallback, ResolvedLocation } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL } from "./types";

// Fetches weather data for a given latitude and longitude, using a callback to return the result.
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

// Fetches news data, using a callback to return the result.
function fetchNewsCallback(callback: (err: Error | null, data?: NewsResponse) => void): void {
  httpGetCallback(NEWS_URL, (err, raw) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(raw as string) as NewsResponse);
    } catch (parseErr) {
      callback(parseErr as Error);
    }
  });
}

// Asks the user for a city name, geocodes it, then fetches weather and news in a nested callback style.
function run(): void {
  promptForCityCallback((cityName) => {
    if (!cityName) {
      console.error("No city entered — please try again and type a name.");
      return;
    }
    console.log(`[callback] Looking up "${cityName}"...`);
    geocodeCityCallback(cityName, (geoErr, location) => {
      if (geoErr) {
        console.error("[LOCATION]", geoErr.message);
        return;
      }
      runWithLocation(location as ResolvedLocation);
    });
  });
}


// Runs the callback-style pipeline for a given resolved location.
function runWithLocation(location: ResolvedLocation): void {
  console.log(`\n[callback] Fetching weather for ${location.name}...`);

  // Fetches location's weather, then fetches news in a nested callback style.
  fetchWeatherCallback(location.latitude, location.longitude, (weatherErr, weather) => {
    if (weatherErr) {
      console.error("[WEATHER]", weatherErr.message);
      return; 
    }

    console.log(`[WEATHER] ${weather!.current_weather.temperature}°C, wind ${weather!.current_weather.windspeed} km/h`);
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
