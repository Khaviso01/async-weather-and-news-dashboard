import { httpGetPromise } from "./httpClient";
import { WeatherResponse, NewsResponse, WEATHER_URL, NEWS_URL, DEFAULT_LOCATION } from "./types";

// Converting weather response into JavaScript object
function fetchWeatherPromise(lat: number, lon: number): Promise<WeatherResponse> {
    return httpGetPromise(WEATHER_URL(lat, lon)).then((raw) => JASON.parse(raw) as WeatherResponse);
}

function fetchNewsPromise(): Promise<NewsResponse> {
  return httpGetPromise(NEWS_URL).then((raw) => JSON.parse(raw) as NewsResponse);
}