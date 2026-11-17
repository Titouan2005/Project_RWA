# Test Plan

Tools: Vitest + React Testing Library (unit, API, components, pages), Playwright (end-to-end in a real browser), coverage with v8.
The tests were defined with the help of an AI (see tests/AI_PROMPTS.md).

## What we test and why
- lib/validation.ts: the most critical business rule, every write goes through it
- lib/products.ts: PocketBase access, the 404 case and other errors
- lib/pocketbase.ts: the client uses the right URL
- lib/stats.ts: stock per brand used by both charts
- lib/redis.ts and lib/homeContent.ts: home page content and the cases where Redis fails
- app/api/**: HTTP status codes (200, 201, 204, 400, 404, 500) and cache invalidation
- components/**: form, delete button, charts
- app/**/page.tsx: page rendering with mocked data
- Playwright: real user journeys (create, edit, delete, admin, 404, API)

## Varied test strings (validation and form)
empty, spaces only, 1 character, 50 / 51 characters, 100 / 101, 1000 / 1001,
digits only ("12345", "0"), wildcards and symbols (% * _ ?), SQL injection ("' OR 1=1 --"),
HTML (<script>alert(1)</script>), paths ("../../etc/passwd"), templates ("{{7*7}}"),
accents and unicode, Japanese, emojis, line breaks, tabs, backslash.

## Test cases
| ID | Target | Case | Expected result |
|----|--------|------|-----------------|
| V1 | validation | complete valid product | ok, same data |
| V2 | validation | spaces around texts | texts trimmed |
| V3 | validation | description and stock missing | "" and 0 |
| V4 | validation | exact limits (50/100/1000, price 0 and 100000, stock 0 and 100000) | ok |
| V5 | validation | strange strings (list above) | accepted as text |
| V6 | validation | invalid fields (empty, too long, wrong type, NaN, Infinity, negative, decimal) | error on the right field |
| V7 | validation | body is not an object (null, array, text, number) | "JSON object" error |
| S1 | stats | stock summed by brand, empty list, brand with 0 stock, input not modified | correct values |
| B1 | pocketbase | default URL and PB_URL variable | correct base URL |
| P1 | products | list, read, create, update, delete | data correctly mapped |
| P2 | products | PocketBase 404 | null / false |
| P3 | products | other PocketBase error | error propagated |
| R1 | redis | one client reused, errors logged | single connection |
| H1 | homeContent | content present, missing, invalid JSON, Redis down | content or null |
| A1 | API list/create | 200, 201, 400 (invalid JSON, validation), 500 | right code + cache invalidation |
| A2 | API [id] | GET 200/404/500, PUT 200/400/404/500, DELETE 204/404/500 | right code + invalidation |
| C1 | ProductForm | add, edit, API errors, strange strings | correct request, error message |
| C2 | DeleteButton | cancel, success, failure | correct behaviour |
| C3 | charts | stock per brand passed to Recharts (bar) and Chart.js (line), empty list | correct data |
| G1 | pages | home, list, detail, edit, add, admin, 404 | expected rendering |
| E1 | e2e | create, edit, delete a laptop | full journey works |
| E2 | e2e | invalid form | server error message visible |
| E3 | e2e | page that does not exist | "Page not found" |
| E4 | e2e | /admin | both charts displayed |
| E5 | e2e | API called directly (list, 400, 404, strange strings) | correct codes |
| E6 | e2e | home page | text from Redis displayed |
| E7 | e2e | navigation bar | links to the main pages |

## Excluded from unit coverage (and why)
- app/layout.tsx: static HTML layout, checked by the Playwright navigation test (E7)
- components/AdminCharts.tsx: lazy loading with next/dynamic, checked by Playwright (E4)
- lib/types.ts: TypeScript types only, no code to run
