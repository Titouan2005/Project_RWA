# Optimisations

Two optimisations were implemented, in addition to the Redis cache used for the home page text.

## Optimisation 1: Next.js data cache with on-demand invalidation

### Problem
The products list is needed by `/products` and `/admin`. Without a cache, every visit to these pages sends a request to PocketBase, even though the data rarely changes.

### Solution
The request to PocketBase in `listProducts()` (`lib/products.ts`) uses the Next.js data cache. The response is stored with the tag `products` and is kept for at most 5 minutes:

```ts
const res = await fetch(
  `${base}/api/collections/laptops/records?perPage=500&sort=brand,model`,
  { next: { tags: ["products"], revalidate: 300 } }
);
```

A cache must never show old data after a change made in the app. So every route handler that writes to the database clears the cache straight after a successful write (POST in `app/api/products/route.ts`, PUT and DELETE in `app/api/products/[id]/route.ts`):

```ts
revalidateTag("products", { expire: 0 });
```

`expire: 0` makes the cached entry expire immediately, so the next request reads fresh data from PocketBase. The cache is not cleared when the request fails (validation error, 404, 500); the unit tests check this.

### Why this choice
- It uses a feature built into Next.js: no extra service to run.
- Tags make it possible to clear exactly the data that changed.
- The 5-minute `revalidate` is a safety net for changes made outside the app (for example directly in the PocketBase admin panel), which do not go through the API routes.

### Evidence
`next.config.ts` enables fetch logging (`logging: { fetches: { fullUrl: true } }`), so the terminal shows for each request whether the cache was used.

The test below was run with `curl` against the development server, with no browser involved: two reads of `/products`, a laptop created through the API, two reads, the laptop deleted, and one last read. `grep -c CacheTest` counts whether the test laptop is in the page.

| Step | Next.js terminal | PocketBase request | Laptop in the page |
|------|------------------|--------------------|--------------------|
| Read `/products` (data already cached) | `cache hit` | 5 ms (served from the cache) | |
| `POST /api/products` | `revalidateTag("products")` runs | | |
| Read `/products` right after the POST | `cache skip`: the expired entry is not used, the list is fetched again from PocketBase | 27 ms | yes (1) |
| Read `/products` again | `cache hit` | 5 ms | yes (1) |
| `DELETE /api/products/[id]` | `revalidateTag("products")` runs | | |
| Read `/products` right after the DELETE | `cache skip`, fetched again from PocketBase | 28 ms | no (0) |

What this shows:
- When nothing has changed, the list is served from the cache: PocketBase is not queried.
- Straight after a write, the cache is not used and fresh data is read from PocketBase, so the new laptop appears immediately and the deleted one disappears immediately. The fresh result is then cached again for the next visitors.
- In development, Next.js labels the read after `revalidateTag(..., { expire: 0 })` as `cache skip` rather than `cache miss`; in both cases the data comes from PocketBase and not from the cache.
- The time saved is small here (about 5 ms instead of about 27 ms) because PocketBase runs on the same machine as Next.js. The main gain is the number of database requests: with many visitors, or a database on another server, every page view no longer means a database query.

Screenshot: the Next.js terminal and the `curl` commands side by side.

## Optimisation 2: lazy loading of the chart libraries

### Problem
Recharts and Chart.js are large libraries. They are only needed on `/admin`, and they need the browser to draw (Recharts measures the size of its container, Chart.js draws on a canvas).

### Solution
`components/AdminCharts.tsx` loads the two chart components with `next/dynamic`:

```ts
const StockBarChart = dynamic(() => import("./StockBarChart"), {
  ssr: false,
  loading: () => <p>Loading chart…</p>,
});
```

- Each library is put in its own JavaScript file (chunk), downloaded only when the chart is about to be displayed.
- `ssr: false` stops the server from rendering the charts, since they can only be drawn in the browser.
- The page and its title appear first, with a "Loading chart…" placeholder, then the charts appear when their code has arrived.

### Why this choice
- The admin page becomes visible and usable before the heavy chart code is downloaded.
- No other page ever downloads the chart libraries.
- It needs only a small change to one component.

### Evidence
Measured with a production build (`npm run build` then `npm run start`), Chrome DevTools, Network tab, "Disable cache" ticked, filter "JS". "Without lazy loading" means the two `dynamic(...)` calls temporarily replaced by normal `import` statements.

**Full reload of `/admin`**

| JavaScript | Without lazy loading | With lazy loading |
|------------|----------------------|-------------------|
| Loaded with the page (initiator `admin`) | 301 kB (7 files, including one 160 kB file with both chart libraries) | 143.5 kB (7 files) |
| Loaded afterwards, on demand (initiator: Turbopack runtime) | 1.5 kB | 161.7 kB (3 files: 107 kB, 53.2 kB and 1.5 kB) |
| Total | 302 kB | 305 kB |

**Clicking the "Admin" link from the home page**

| JavaScript downloaded at the click | Without lazy loading | With lazy loading |
|------------------------------------|----------------------|-------------------|
| Files | 0 | 3 (107 kB, 53.2 kB, 2.4 kB) |
| Size | 0 kB | 163 kB |

### What the numbers show
- With lazy loading, the JavaScript the page needs before it can be displayed drops from 301 kB to 143.5 kB, about 52% less. The page and its titles appear first, then the two chart libraries (about 160 kB) arrive in separate files.
- The total stays about the same (302 kB vs 305 kB): lazy loading does not remove code, it moves the heavy part out of the first load.
- Without lazy loading, clicking "Admin" downloads no JavaScript at all: the chart libraries had already been downloaded while the user was on the home page, because Next.js prefetches the pages linked in the navigation bar, and the navigation bar is on every page. Every visitor therefore downloads about 160 kB of chart code, even if they never open `/admin`. With lazy loading, this code is only downloaded when `/admin` is actually opened.

Screenshots: Network tab on `/admin`, full reload and navigation, with and without lazy loading.
