# Laptop Manager (RWA Assignment 1)

A product management web application for laptops, built with Next.js (App Router, TypeScript) and PocketBase, with the home page text served from Redis.

The original brief is in [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md).

## Features

- Home page whose text is stored in Redis (key `home:content`) and read on every load
- Products list, add, edit, view and delete pages
- REST API routes: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`, with server-side validation
- `/admin` page with two charts of the stock per brand: a bar chart (Recharts) and a line chart (Chart.js)
- Two optimisations: Next.js data cache with on-demand invalidation, and lazy loading of the chart libraries ([docs/optimisations.md](docs/optimisations.md))
- Unit tests (Vitest + React Testing Library, 100% coverage) and end-to-end tests (Playwright)

## Tech stack

| Part | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Database | PocketBase 0.40.6, collection `laptops` (brand, model, price, description, stock) |
| Text cache | Redis (Redis Cloud free tier) with the `redis` Node client |
| Charts | Recharts (bar), Chart.js with react-chartjs-2 (line) |
| Tests | Vitest, React Testing Library, jsdom, v8 coverage, Playwright |

## Project structure

```
Project_RWA/
├── .devcontainer/            Codespaces configuration
├── docs/                     assignment, optimisations, chart comparison, test outputs
└── 2026-DemoApp-main/        the Next.js app
    ├── app/                  pages and API route handlers
    ├── components/           ProductForm, DeleteButton, charts
    ├── lib/                  PocketBase, Redis, validation, products service, stats
    ├── pocketbase/           pb_migrations (the binary and pb_data are not committed)
    ├── scripts/              PocketBase setup, seed scripts, home page text
    └── tests/                TEST_PLAN.md, AI_PROMPTS.md, unit/, e2e/
```

## Getting started

The repository is set up for GitHub Codespaces: opening it runs `npm install`, downloads PocketBase and installs the Playwright browser. On another machine, run those three steps by hand (see `.devcontainer/devcontainer.json`).

1. Environment variables: in `2026-DemoApp-main`, copy `.env.example` to `.env.local` and set `REDIS_URL` to your Redis connection string.

2. Start PocketBase (terminal 1):
   ```
   cd 2026-DemoApp-main/pocketbase
   ./pocketbase serve
   ```
   The migration creates the `laptops` collection. Open `http://127.0.0.1:8090/_/` once to create the admin account.

3. Seed the data (terminal 2):
   ```
   cd 2026-DemoApp-main
   node scripts/seed-laptops.mjs
   node --env-file=.env.local scripts/seed-redis.mjs
   ```
   The laptop seed can be run again safely: existing laptops are updated, missing ones are created.

4. Start the app:
   ```
   npm run dev
   ```
   Then open port 3000.

## Tests

```
npm test                 # unit tests
npm run test:coverage    # unit tests with coverage report
npm run test:e2e         # end-to-end tests (PocketBase and Redis must be running)
```

Stop any running `next dev` before the end-to-end tests: Playwright starts its own server.

The test plan is in [tests/TEST_PLAN.md](2026-DemoApp-main/tests/TEST_PLAN.md) and the AI prompts used to define the tests are in [tests/AI_PROMPTS.md](2026-DemoApp-main/tests/AI_PROMPTS.md). The latest outputs are saved in `docs/test-output/`.

## Documentation

- [docs/optimisations.md](docs/optimisations.md): the two optimisations, how they were implemented and measured
- [docs/CHARTS_COMPARISON.md](docs/CHARTS_COMPARISON.md): Recharts vs Chart.js
