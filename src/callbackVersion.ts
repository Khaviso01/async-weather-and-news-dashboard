import { httpGetCallback } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL, DEFAULT_LOCATION } from "./types";

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