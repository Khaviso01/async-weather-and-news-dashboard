# Async Weather & News Dashboard

A small project built to demonstrate the three ways JavaScript/TypeScript
handle asynchronous work — **callbacks**, **promises**, and **async/await**
— using two real public APIs:

- **Weather**: [Open-Meteo](https://open-meteo.com/) (`current_weather`, no API key needed)
- **News headlines**: [DummyJSON Posts](https://dummyjson.com/posts) (no API key needed)

It ships in two parts:

1. **A Node.js + TypeScript CLI** (`src/`): three standalone scripts, one per
   async style, runnable with `npm run callback|promise|async`.
2. **A browser dashboard** (`dashboard/index.html`): a single-file, fully
   responsive UI that runs the same three styles live, plus `Promise.all()`
   and `Promise.race()`, with a terminal-style execution trace so you can
   *watch* the event loop work.

---

## 1. Project structure

```
.
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── types.ts              # shared interfaces + API URLs
│   ├── httpClient.ts         # httpGetCallback()/httpGetPromise() over Node's https module, plus the city prompt and geocoding helpers
│   ├── callbackVersion.ts    # Sprint 2 — nested callbacks ("callback hell")
│   ├── promiseVersion.ts     # Sprint 3 — .then() chains, Promise.all, Promise.race
│   └── asyncAwaitVersion.ts  # Sprint 4 — async/await with try...catch

```

`httpClient.ts` is the one piece of shared plumbing: `httpGetCallback` is a
raw Node-style error-first callback function, and `httpGetPromise` simply
wraps it in a `Promise`. Because `promiseVersion.ts` and
`asyncAwaitVersion.ts` both build on `httpGetPromise`, all three CLI scripts
hit the network in exactly the same way — the only thing that changes
between them is the **control flow** wrapped around that call, which is the
point of the exercise.

## 2. Setup

```bash
npm install
```

Requires Node.js 18+ (for global `fetch`/https support and ts-node).

## 3. Running the CLI versions

```bash
npm run callback   # nested callbacks
npm run promise    # .then() chains + Promise.all + Promise.race
npm run async      # async/await with try...catch
```

Or run all three back-to-back:

```bash
npm run test:all
```

Weather and news are fetched for whatever city you type when prompted — no
default location is hardcoded. When you run any of the three scripts,
it asks:

```
Enter a city or town:
```

Type any place name (e.g. `Polokwane`, `Cape Town`, `Tokyo`) and press
Enter. It's resolved to coordinates automatically via Open-Meteo's free
geocoding API (no key needed — same as the weather and news APIs), then
weather and news are fetched for that location.

If the name can't be found, you'll see a clean error and the script exits. Just run it again and try another spelling.

## 4. Sample console output

### `npm run callback`

```
[callback] Fetching weather for Polokwane, Limpopo...
[WEATHER] 22.4°C, wind 11.3 km/h
[callback] Weather done, now fetching news (nested)...
[NEWS] 5 headlines received:
   1. His mother had always taught him
   2. Historically, most enterprise-level applications
   3. She had always loved the smell of ...
   4. Even though she had been programming for years
   5. He was an expert but not in a discipline
[callback] Done. Notice the indentation — that's callback hell.
```

### `npm run promise`

```
[promise] Chained: weather -> news for Polokwane, Limpopo
[WEATHER] 22.4°C, wind 11.3 km/h
[NEWS] 5 headlines received:
   1. ...
   5. ...

[promise] Promise.all(): weather + news simultaneously
Both resolved in 184ms
[WEATHER] 22.4°C, wind 11.3 km/h
[NEWS] 5 headlines received:
   ...

[promise] Promise.race(): whichever of weather/news answers first
"news" won the race in 97ms
```

### `npm run async`

```
[async] Sequential: weather -> news for Polokwane, Limpopo
[WEATHER] 22.4°C, wind 11.3 km/h
[NEWS] 5 headlines received:
   ...

[async] Promise.all(): weather + news simultaneously
Both resolved in 176ms
...

[async] Promise.race(): whichever of weather/news answers first
"weather" won the race in 88ms
```

### Simulated failure (e.g. no network / DNS blocked)

Every version reports errors the same way, because they all bottom out in
the same `httpGetCallback` / `httpGetPromise` functions:

```
[WEATHER] Request failed with status 500 for https://api.open-meteo.com/...
```
or
```
Promise.all failed (one request rejected): getaddrinfo ENOTFOUND api.open-meteo.com
```

---
