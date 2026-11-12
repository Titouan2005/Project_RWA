# Test Plan

Tools: Vitest + React Testing Library (units, API, components, pages), Playwright (end-to-end in a real browser), coverage with v8.
The tests were defined with the help of an AI (see tests/AI_PROMPTS.md).

## What we test and why
- lib/validation.ts: this is the most critical business rule, everyone goes through it
- lib/products.ts: PocketBase access, case 404, and errors
- lib/stats.ts: graph calculations
- lib/redis.ts and lib/homeContent.ts: home page cache and cases where Redis is broken
- app/api/** : HTTP codes (200, 201, 204, 400, 404, 500) and cache invalidation
- components/** : form, deletion, charts
- app/**/page.tsx: rendering pages with simulated data
- Playwright: real paths (create, edit, delete, admin, 404, API)

## Various test chains (validation and form)
blank, spaces only, 1 character, 50 / 51 characters, 100 / 101, 1000 / 1001,
numbers alone ("12345", "0"), wildcards and symbols (% * _ ?), SQL injection ("' OR 1=1 --"),
HTML (<script>alert(1)</script>), paths ("../../etc/passwd"), templates ("{{7*7}}"),
accents and unicode, Japanese, emojis, line breaks, tabs, backslash.

## Case Table
| ID | Target | Case | Expected Outcome |
|----|-------|-----|------------------|
| V1 | validation | complete product valid | ok, same data |
| V2 | validation | spaces around texts | cleaned texts (trim) |
| V3 | validation | description and stock missing | "" and 0 |
| V4 | validation | exact limits (50/100/1000, prices 0 and 100000, stock 0 and 100000) | ok |
| V5 | validation | strange strings (list above) | accepted as text |
| V6 | validation | invalid fields (empty, too long, wrong type, NaN, Infinity, negative, decimal) | error on the correct field |
| V7 | validation | non-object body (null, table, text, number) | "JSON object" error |
| S1 | stats | sum of stock by brand, empty list, price sorting | correct values |
| P1 | products | list, reading, creation, modification, deletion | data properly processed |
| P2 | products | 404 PocketBase | null / false |
| P3 | products | other PocketBase error | propagated error |
| R1 | redis | only one client reused, logged in error | single login |
| H1 | homeContent | content present, absent, invalid JSON, Redis broken | content or null |
| A1 | List API/creation | 200, 201, 400 (invalid JSON, validation), 500 | good code + cache invalidation |
| A2 | API [id] | GET 200/404/500, PUT 200/400/404/500, DELETE 204/404/500 | good code + invalidation |
| C1 | ProductForm | add, edit, API errors, strange strings | fetch successfully, error message |
| C2 | DeleteButton | cancellation, success, failure | good behavior |
| C3 | charts | data transmitted to bookstores | correct data |
| G1 | pages | home, list, detail, editing, adding, admin, 404 | expected delivery |
| E1 | e2e | create, modify, delete a laptop | complete journey |
| E2 | e2e | invalid form | visible error message |
| E3 | e2e | page not existing | "Page not found" |
| E4 | e2e | /admin | the two displayed graphs |
| E5 | e2e | Direct API (list, 400, 404, strange strings) | correct codes |

## Out of unit coverage (and why)
- app/layout.tsx: simple HTML typo, verified by Playwright navigation
- components/AdminCharts.tsx: delayed loading (next/dynamic), verified by Playwright (E4)



exclude: ["app/layout.tsx", "components/AdminCharts.tsx", "lib/types.ts"],