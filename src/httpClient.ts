import * as https from "https";
import * as readline from "readline";
import { GEOCODE_URL } from "./types";

// HTTP GET request using Node's built-in https module, callback style.
export function httpGetCallback(
  url: string,
  callback: (err: Error | null, data?: string) => void
): void {
  https
    .get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        callback(new Error(`Request failed with status ${res.statusCode} for ${url}`));
        res.resume(); // drain the response so Node can free the socket
        return;
      }

      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          callback(null, raw);
        } catch (parseErr) {
          callback(parseErr as Error);
        }
      });
    })
    .on("error", (err) => callback(err));
}

// Wrapps callback style httpGetCallback() in a Promise so it can be used with async/await.
export function httpGetPromise(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    httpGetCallback(url, (err, data) => {
      if (err) reject(err);
      else resolve(data as string);
    });
  });
}

// Opens CLI prompt for user to enter a city name, then calls the callback with the trimmed string.
export function promptForCityCallback(callback: (city: string) => void): void {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Enter a city or town: ", (answer) => {
    rl.close();
    callback(answer.trim());
  });
}

// Wraps the callback-style promptForCityCallback in a Promise.
export function promptForCityPromise(): Promise<string> {
  return new Promise((resolve) => {
    promptForCityCallback((city) => resolve(city));
  });
}

export interface ResolvedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface GeocodeApiResult {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  }>;
}

// Converts geocode API result to a resolved location object.
function toResolvedLocation(data: GeocodeApiResult, cityName: string): ResolvedLocation {
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${cityName}"`);
  }
  const r = data.results[0];
  return {
    name: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
    latitude: r.latitude,
    longitude: r.longitude,
  };
}

// Callback-style city lookup
export function geocodeCityCallback(
  cityName: string,
  callback: (err: Error | null, location?: ResolvedLocation) => void
): void {
  httpGetCallback(GEOCODE_URL(cityName), (err, raw) => {
    if (err) return callback(err);
    try {
      callback(null, toResolvedLocation(JSON.parse(raw as string), cityName));
    } catch (parseErr) {
      callback(parseErr as Error);
    }
  });
}

// Promise-style city lookup
export function geocodeCityPromise(cityName: string): Promise<ResolvedLocation> {
  return httpGetPromise(GEOCODE_URL(cityName)).then((raw) =>
    toResolvedLocation(JSON.parse(raw), cityName)
  );
}
