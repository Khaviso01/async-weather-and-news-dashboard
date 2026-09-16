import * as https from "https";

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

export function httpGetPromise(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    httpGetCallback(url, (err, data) => {
      if (err) reject(err);
      else resolve(data as string);
    });
  });
}