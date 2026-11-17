# AI prompts used to define the tests

The brief asks for the tests to be defined with an AI model. I used Claude (Anthropic) in a chat conversation. The AI proposed the test plan and the test cases; I ran every test, read the code, fixed what did not work in my setup, and checked the coverage report.

## 1. Test plan

> Here is my Next.js app (App Router, TypeScript) with PocketBase and Redis: [code of lib/, app/, components/]. Write a test plan for the folder `tests`: what should be tested, with which tools, and why. Give each test case an ID, the target, the case and the expected result. The plan must lead to complete coverage of the app code.

Result: `tests/TEST_PLAN.md` (tools: Vitest, React Testing Library, Playwright; case table V1 to E7).

## 2. Varied input strings

> For the add and edit product form, list the different kinds of input strings we should test: long, short, numbers, wildcards, strange characters, and anything else that often breaks web apps.

Result: the list in the "Varied test strings" section of the plan (limits 50/51, 100/101, 1000/1001, SQL injection, HTML script tag, path traversal, template syntax, unicode, emojis, line breaks...). It is used in `validation.test.ts`, `ProductForm.test.tsx` and the E5 end-to-end tests.

## 3. Unit tests

> Following the plan, write the Vitest unit tests for each file in lib/, each API route handler, each component and each page. Mock PocketBase, Redis, next/navigation and next/cache so the tests do not need any running service. Test the success cases and every error case (400, 404, 500).

Result: the files in `tests/unit/`.

## 4. End-to-end tests

> Write Playwright tests that use the real app with PocketBase and Redis running: create, edit and delete a laptop; a validation error shown in the form; the 404 page; the admin charts; the API called directly with strange strings.

Result: `tests/e2e/app.spec.ts`.

## 5. Reaching full coverage

> Here is my coverage report: [output of npm run test:coverage]. Which lines and branches are not covered, and which tests are missing?

Result: extra tests, including `products.test.ts`, which was missing at first.

## What I checked and changed myself

- Ran every test and read the output; fixed the setup problems (test files containing JSX must end in `.tsx`, `cleanup()` after each test in `tests/setup.ts`, one Playwright worker so the tests do not share the database at the same time).
- Updated the tests when the app was translated into English.
- Checked in the coverage report that the excluded files (`app/layout.tsx`, `components/AdminCharts.tsx`, `lib/types.ts`) are covered by the end-to-end tests or contain no code to run.
