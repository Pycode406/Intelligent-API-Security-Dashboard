# Intelligent API Security Testing Dashboard — Complete Explanation

This document explains **every file, every technology, and every security
concept** used in this project, in beginner-friendly language.

---

## PART 1 — THE BIG PICTURE

### 1.1 What problem does this project solve?

Modern apps almost never work alone — a mobile app, a website, and a
server talk to each other using **APIs (Application Programming
Interfaces)**. An API is basically a waiter in a restaurant: your app
(the customer) asks for something ("give me user 101's profile"), the
API (the waiter) takes that request to the kitchen (the database/server
logic), and brings back a response.

The problem: if the "waiter" doesn't check *who* is asking, it might
bring you *someone else's order* — i.e., someone else's private data.
That is essentially what API security testing is about: **making sure
the API only gives people what they're allowed to have.**

This project builds a small, safe tool that automatically sends a few
careful test requests to an API and reports whether it shows signs of
four common weaknesses.

### 1.2 Why these four checks specifically?

They come from the **OWASP API Security Top 10**, a well-known,
industry-standard list published by OWASP (Open Worldwide Application
Security Project) describing the most common ways APIs get exploited.
We picked the four that are easiest to demonstrate safely, without
needing a real authentication system:

| # | Concept | OWASP Mapping |
|---|---------|----------------|
| 1 | Broken Object Level Authorization (BOLA) | API1 |
| 2 | Broken Object Property Level Authorization | API3 |
| 3 | Sensitive Data Exposure | Overlaps with API1/API3 (not its own 2023 category) |
| 4 | Rate Limiting / Unrestricted Resource Consumption | API4 |

### 1.3 The core methodology: Detection → Evidence → Explanation → OWASP Mapping → Recommendation

This is the "philosophy" of the whole project, and it's worth
memorizing because it's the answer to "what makes your project
different from just printing PASS/FAIL":

1. **Detection** — the scanner sends a controlled request and observes
   the response (status code, headers, body).
2. **Evidence** — instead of just saying "vulnerable," it shows *exactly*
   what request was sent and what came back, so a human can verify it.
3. **Explanation** — a plain-English description of what the finding
   means (either rule-based, or AI-generated via Gemini).
4. **OWASP Mapping** — connects the finding to the recognized industry
   standard, so it's not just "this looks bad," but "this maps to a
   known, documented category of risk."
5. **Recommendation** — a concrete, actionable fix.

This mirrors how **real-world security tools** (like Burp Suite, OWASP
ZAP, or Postman's API security testing) present findings — they never
just say "vulnerable," they always show evidence and reasoning. Doing
this at a beginner level is what makes the project feel professional.

### 1.4 The "controlled testing" philosophy

Every single test in this project follows one rule: **do the smallest,
safest thing that can prove or disprove a weakness.**

- BOLA test: only tries **one** neighboring ID (e.g., 101 → 102), never
  a range or brute-force sweep.
- Property test: sends **one** update request with one restricted field.
- Sensitive data test: only **reads** data, changes nothing.
- Rate limit test: sends a **maximum of 5** requests, never floods.

This matters because real penetration testing tools can accidentally
harm production systems if used carelessly. This project is explicitly
built to never do that — which is also why it always uses cautious
language like *"potential vulnerability"* instead of *"confirmed
vulnerability,"* and *"no rate-limiting response was observed"* instead
of *"this API has no rate limiting."* A lightweight scanner like this
one can never be 100% certain, so honesty about that uncertainty is
part of good security engineering.

---

## PART 2 — THE THREE-SERVER ARCHITECTURE (WHY THREE, NOT ONE?)

```
React Frontend (localhost:5173)
        ↓  (Axios HTTP requests)
Security Scanner Backend (localhost:5001)
        ↓  (Axios HTTP requests)
Local Demo/Test API (localhost:5000)
```

**Why split into three separate servers instead of one big program?**

1. **Separation of concerns** — the frontend's job is only to display
   things and collect input. The backend's job is only to run tests and
   talk to Gemini. The demo API's job is only to *be* a target to scan.
   Mixing these together would make the code much harder to understand,
   debug, and explain.
2. **Realism** — in real life, the tool you use to scan an API is never
   the same server as the API being scanned. Structuring it this way
   makes the project behave like a real-world security tool.
3. **Security** — the Gemini API key lives only on the backend server,
   never on the frontend. Since anything in a React app's code is
   visible to anyone using the browser's developer tools, secrets must
   never be placed there. Keeping the key server-side is a fundamental
   web security rule (this is explained in detail in Part 6).

---

## PART 3 — FILE-BY-FILE EXPLANATION

### 3.1 Root folder

| File | Purpose |
|------|---------|
| `README.md` | Setup and demonstration instructions (for running the project) |
| `.gitignore` | Tells Git which files/folders to **never** upload to GitHub — most importantly `.env` (which holds the real Gemini key) and `node_modules/` (huge auto-generated dependency folders that don't need to be shared). |
| `package.json` (root) | A tiny placeholder file just describing the overall project; the real dependency files are inside `frontend/`, `backend/`, and `test-api/`. |

**Why `.gitignore` matters for security:** if you accidentally commit
your real API key to GitHub, anyone can find it (even in your commit
history, even if you delete it later) and use your Gemini quota, or
worse. This is one of the most common real-world security mistakes
beginners make — this project protects against it structurally.

---

### 3.2 `test-api/` — The Local Demo/Test API

**Why does this folder exist?** So you never have to depend on some
random public API for your presentation (which might be offline, rate
limit you, or behave unpredictably). This is *your own* fully
controlled API with fake data.

| File | Purpose |
|------|---------|
| `package.json` | Lists this mini-server's dependencies: `express` (to build the API) and `cors` (explained below). |
| `demoApi.js` | The entire fake API — all secure and vulnerable endpoints in one file, kept intentionally simple. |

**What's inside `demoApi.js`, and why each part exists:**

- **`demoUsers` object** — a tiny in-memory "database" (just a
  JavaScript object, not a real database like MongoDB or MySQL). Using
  a real database would add unnecessary complexity for a demo; an
  in-memory object is enough to demonstrate the concepts.
- **`toPublicUser()` helper** — strips out the fake secrets (`password`,
  `apiKey`) before sending "safe" responses. This *models* good API
  design: only return what the client actually needs.
- **Secure vs. Vulnerable endpoint pairs** — for every one of the four
  concepts, there are two matching endpoints:
  - `/api/secure/...` → written to **behave correctly** (deny
    unauthorized access, reject bad properties, hide secrets, enforce a
    request limit).
  - `/api/vulnerable/...` → written to **intentionally skip** that
    protection, so the scanner has something real to detect.

  This pairing is the heart of your demo: you can show the *same*
  scanner producing *different, correct* results depending on how the
  target API is built — which proves the scanner is actually reasoning
  about behavior, not just returning a random result.

- **Rate limit counters (`secureProductsRequestCount`, etc.)** — plain
  JavaScript variables that count requests in memory. The secure
  endpoint deliberately returns HTTP `429` after 3 requests to *simulate*
  what a real rate limiter would do (in production, this would usually
  be a proper middleware/library, or handled at the infrastructure
  level, e.g. via a reverse proxy or API gateway — but simulating it
  here keeps the demo self-contained and easy to explain).

---

### 3.3 `backend/` — The Security Scanner Backend

This is the "brain" of the whole project — it decides what a "secure"
vs. "vulnerable" behavior looks like, runs the tests, scores them, and
talks to Gemini.

#### `backend/package.json`
Lists dependencies: `express`, `axios`, `cors`, `dotenv` — explained
individually in Part 4.

#### `backend/.env` and `backend/.env.example`
- `.env` holds your **real** Gemini key and is never committed to Git
  (blocked by `.gitignore`).
- `.env.example` is a **safe template** with a placeholder value, so
  anyone downloading your project from GitHub knows *what* environment
  variable to set, without ever seeing your real key.

This separation (`.env` vs `.env.example`) is a **standard industry
practice** for managing secrets in any real software project.

#### `backend/server.js`
The entry point. It:
1. Loads environment variables with `dotenv`.
2. Creates the Express app.
3. Enables CORS (explained in Part 4) so the frontend on a different
   port is allowed to call it.
4. Enables JSON body parsing (`express.json()`), so the backend can
   read data sent from the frontend (like the URL to scan).
5. Registers all routes from `scanRoutes.js` under `/api`.
6. Adds a **global error handler** — if anything throws an unexpected
   error, the server responds with a generic error message instead of
   crashing. This directly satisfies the project requirement: *"Gemini
   failure does not crash the application"* and, more broadly, *no
   error anywhere should crash the whole backend.*

#### `backend/routes/scanRoutes.js`
Defines the **API contract** — the exact list of URLs the frontend is
allowed to call:
- `POST /api/scan` → full dashboard scan (all checks at once)
- `POST /api/scan/bola`
- `POST /api/scan/property-authorization`
- `POST /api/scan/sensitive-data`
- `POST /api/scan/rate-limit`
- `POST /api/explain` → Gemini "Explain Why"

Keeping routes in their own file (instead of cramming everything into
`server.js`) is a common **backend organization pattern** called
"separation of routing from logic" — it makes it easy to see, at a
glance, every endpoint the backend exposes.

#### `backend/controllers/scanController.js`
This file **coordinates** the tests — it doesn't contain the actual
security-checking logic itself (that lives in `scanner/`), it just:
1. Reads the `url` the user submitted.
2. Makes one preliminary request to that URL to get baseline status
   code and headers (used for HTTPS/header/auth checks).
3. Calls each individual scanner module in turn.
4. Collects all results into one array.
5. Calls `calculateScore()` to turn the results into a score + risk
   level.
6. Sends everything back to the frontend as JSON.

This is the **Controller** part of a common backend design pattern
called **MVC-ish separation** (Model-View-Controller-inspired): the
controller handles "what should happen when this route is hit,"
while the actual business logic (security checks) lives elsewhere.

#### `backend/controllers/aiController.js`
Handles **only** the Gemini "Explain Why" feature. Explained in full
detail in Part 6 (AI Integration Security).

#### `backend/scanner/` — the actual detection logic

This is the most important folder to understand, since
it's where the real "security testing" happens. Each file is a small,
focused module — this is called the **Single Responsibility
Principle**: each file does exactly one job, which makes it much
easier to test, explain, and debug.

- **`httpsCheck.js`** — Simply checks if the URL string starts with
  `https://`. This is a *very* lightweight signal: HTTPS means the
  connection is encrypted using TLS (Transport Layer Security), so data
  traveling between client and server can't be read or tampered with by
  someone intercepting the network traffic (a "man-in-the-middle"
  attack). No actual network-level TLS inspection is done — it's a
  simple string check, appropriate for a beginner project.

- **`headerCheck.js`** — Looks at four HTTP response headers that are
  widely recommended security best practices:
  - `Content-Security-Policy` — restricts what content (scripts, etc.)
    a browser is allowed to load, reducing the risk of malicious script
    injection (XSS attacks).
  - `X-Content-Type-Options` — stops browsers from "guessing" a file's
    type, which can prevent certain attacks where a file is disguised
    as something else.
  - `Strict-Transport-Security` (HSTS) — tells browsers "always use
    HTTPS with me, never downgrade to HTTP."
  - `X-Frame-Options` — prevents "clickjacking," where a malicious site
    embeds your page in a hidden invisible frame to trick users into
    clicking something.

  If any are missing, this is only reported as a `WARNING`, never a
  confirmed vulnerability — because plenty of legitimate APIs don't set
  every header and it doesn't automatically mean they're unsafe.

- **`authenticationCheck.js`** — a *very* soft signal check: does the
  response look like it required authentication (401/403 status, or a
  `WWW-Authenticate` header)? This never tries to break authentication —
  it only observes.

- **`bolaCheck.js`** — the BOLA detector. Step by step:
  1. Finds the numeric ID at the end of the URL using a **regular
     expression** (a pattern-matching tool for text) — e.g., pulls
     `101` out of `.../users/101`.
  2. Sends the **original** request exactly as given.
  3. Builds a **second URL** by replacing that ID with `id + 1` (e.g.,
     102) and sends that request too.
  4. If the second request also returns `200 OK` with real data, that's
     `POTENTIAL VULNERABILITY` — the API let you view someone else's
     object without checking who you are.
  5. If it's denied (401/403/404), that's a `PASS`.

  **Why only ±1, not more IDs?** Because the goal is to *prove the
  concept* safely, not to brute-force scan every possible user in the
  system — that would cross the line from "testing" into "attacking."

- **`propertyAuthorizationCheck.js`** — the Property-Level
  Authorization detector. Sends **one** `PUT` request trying to change
  a property that a normal user shouldn't be able to touch (default:
  `role` → `admin`). If the server *accepts* it (200/201), that's a red
  flag — a regular user might be able to silently make themselves an
  admin. If it's rejected, that's a `PASS`.

- **`sensitiveDataCheck.js`** — the Sensitive Data detector.
  1. Sends a `GET` request and gets back the JSON body.
  2. **Recursively** (meaning: it also looks inside nested objects, not
     just top-level fields) scans every field *name* — never the value
     — against a list of suspicious terms: `password`, `token`,
     `apiKey`, `secret`, `creditCard`, `ssn`, etc.
  3. If any match, it reports them as `fieldName -> [HIDDEN]` — the
     **actual value is never read into the evidence text at all**, only
     the field name. This is a deliberate privacy-by-design choice: even
     if the scanner found a real password, it would never display it
     anywhere in the UI.

- **`rateLimitCheck.js`** — the Rate Limiting detector.
  1. Sends **exactly 5** requests to the target URL, one after another,
     in a simple loop.
  2. Records the status code and response time of each.
  3. If *any* of the 5 responses is `429 Too Many Requests`, that's a
     `PASS` (the API is protecting itself).
  4. If none are, that's a `WARNING` — carefully worded as *"no
     rate-limiting response was observed during this controlled test"*
     rather than *"this API has no rate limiting,"* because 5 requests
     genuinely cannot prove the complete absence of rate limiting (maybe
     the real limit is 1000 requests/minute).

#### `backend/utils/calculateScore.js`
Turns a list of findings into a single number, using simple
subtraction — explained fully in Part 5 (Scoring Methodology).

#### `backend/utils/recommendations.js`
A dictionary (JavaScript object) mapping each check name to a
plain-English fix. This is the **fallback** recommendation always shown
under "Recommended Fix," and is also the safety net used if Gemini is
unavailable.

---

### 3.4 `frontend/` — The React Dashboard

#### `frontend/package.json`, `vite.config.js`, `index.html`
Standard setup files for a **Vite + React** project:
- `package.json` lists dependencies (`react`, `react-router-dom`,
  `axios`, `jspdf`) and defines the `npm run dev` command.
- `vite.config.js` tells the **Vite** build tool to use the React
  plugin and run on port `5173`.
- `index.html` is the single, real HTML page — React "mounts" (injects)
  the entire app into the `<div id="root">` element here. This is how
  every modern React app works — it's called a **Single Page
  Application (SPA)**: the browser only loads one real HTML page, and
  React swaps content in and out of it as you navigate.

#### `frontend/src/main.jsx`
The actual entry point of the React app. It wraps the whole app in
`<BrowserRouter>`, which enables React Router's page-navigation system
without full page reloads (explained below).

#### `frontend/src/App.jsx`
Defines every **route** (URL path) in the app and which page component
renders for it, using `react-router-dom`. It also holds the
`latestScan` state (using React's `useState` hook) so that after you
run a scan on the Dashboard, the Report page can access those same
results — without needing a database or complex state-management
library like Redux.

**Why React Router instead of separate HTML files per page?** Because
in a Single Page Application, "pages" aren't separate files loaded from
the server — they're just different React components shown based on the
current URL, swapped instantly without a full page reload. This is
faster and feels more like a real modern web app.

#### `frontend/src/index.css`
All the styling, using **plain CSS** (deliberately, no Tailwind, as
required). Key ideas beginners should know:
- **CSS variables** (`:root { --primary-blue: ... }`) — define a color
  once, reuse it everywhere. Change the value in one place, and the
  whole app's theme updates. This is why the blue/white theme is
  consistent across every page.
- **Class-based styling** (`.btn`, `.card`, `.badge-pass`) — reusable
  style "recipes" applied to any element via `className="..."` in React.

#### `frontend/src/services/api.js`
The **only** file in the frontend that talks to the backend. Centralizing
all `axios` calls here (instead of scattering `fetch`/`axios` calls
across every page) means:
- If the backend's address ever changes, you only update it in one
  place.
- Every page gets the **same consistent error handling** via the
  `safeCall()` helper, which always returns `{ ok: true/false, ... }` —
  so pages never need to write their own `try/catch` logic. This is the
  **DRY principle** ("Don't Repeat Yourself") in action.

#### `frontend/src/components/` (reusable building blocks)

| Component | Purpose |
|---|---|
| `Navbar.jsx` | The top navigation bar, shown on every page via `App.jsx`. Uses `NavLink` (instead of plain `Link`) so it can automatically highlight the current page. |
| `ApiForm.jsx` | A reusable text-input + "Start Scan" button, used by the Dashboard and three of the four test pages, so the same input UI doesn't need to be rewritten five times. |
| `SecurityScore.jsx` | Displays the big circular score number and risk level on the Dashboard. |
| `SecurityChecks.jsx` | A short summary list of which tests ran and their status — a quick glance before scrolling to full details. |
| `VulnerabilityList.jsx` | Renders the full, detailed card for every finding (status badge, severity, OWASP mapping, evidence box, recommendation, and the Explain Why button). |
| `Recommendations.jsx` | Pulls out only the *actionable* findings (anything that isn't a clean PASS) into a short "what to fix" list. |
| `ExplainWhy.jsx` | The AI button — calls the backend's `/api/explain` route and displays either Gemini's answer or the fallback message. Explained fully in Part 6. |

#### `frontend/src/pages/` (the actual screens)

| Page | Route | Purpose |
|---|---|---|
| `Home.jsx` | `/` | The educational landing page — explains APIs, API security, and all four concepts with examples, plus the "How It Works" flow diagram. |
| `Dashboard.jsx` | `/dashboard` | Enter one URL, click **Start Security Scan**, and see *all four* checks (plus HTTPS/header/auth) at once, with an overall score. |
| `BOLATest.jsx` | `/bola` | Focused single-purpose page just for the BOLA test. |
| `PropertyAuthorizationTest.jsx` | `/property-authorization` | Lets you customize the property name and test value (not just `role`/`admin`), then runs the test. |
| `SensitiveDataTest.jsx` | `/sensitive-data` | Focused page for the sensitive-field detector, reminding the user that values are always masked. |
| `RateLimitTest.jsx` | `/rate-limit` | Focused page showing the 5-request table (request #, status, response time). |
| `Report.jsx` | `/report` | Shows the most recent Dashboard scan and lets you **download a PDF** via `jsPDF`. |

**Why separate test pages *and* a combined Dashboard?** The Dashboard
gives a fast "overall health check" experience (matches how real tools
like security dashboards work), while the individual pages let you
demonstrate — and explain in detail — exactly *one* concept at a time,
which is much better for a viva presentation than scrolling through one
long combined page.

---

## PART 4 — TECH STACK, EXPLAINED SIMPLY (AND WHY EACH CHOICE IS SECURE/APPROPRIATE)

| Technology | What it is | Why it was chosen here |
|---|---|---|
| **React** | A JavaScript library for building user interfaces out of reusable "components." | Beginner-friendly, huge community, and its component model matches this project perfectly (Navbar, ApiForm, ExplainWhy, etc. are all separate, reusable pieces). |
| **Vite** | A fast development server/build tool for modern JS frontends. | Much faster and simpler to configure than older tools like Webpack — ideal for a college project where you want to focus on the app, not build configuration. |
| **React Router (`react-router-dom`)** | Handles page navigation in a Single Page Application. | Lets the app have distinct URLs (`/dashboard`, `/bola`, etc.) without needing a separate backend page for each one. |
| **Axios** | A library for making HTTP requests (GET, POST, PUT) from JavaScript, used in both frontend and backend. | Simpler syntax than the built-in `fetch`, and it lets us pass options like `timeout` and `validateStatus` easily (very useful for security scanning, since we *want* to see 403/429 responses instead of Axios treating them as crashes). |
| **Express** | A minimal Node.js web framework for building backend servers (used for both the scanner backend and the demo API). | The most widely-taught, beginner-friendly backend framework in the Node.js ecosystem — small, unopinionated, and easy to explain line by line. |
| **CORS (`cors` package)** | A security feature that controls which websites are allowed to call your backend from a browser. | By default, browsers **block** a webpage on `localhost:5173` from calling a server on `localhost:5001` (this is the browser's built-in **Same-Origin Policy**, a fundamental web security protection). The `cors` middleware explicitly tells the backend "it's OK to accept requests from this frontend," which is required for the app to function *and* is a deliberate, visible security boundary — a great thing to mention in a viva as an example of "security by design." |
| **dotenv** | Loads variables from a `.env` file into `process.env` in Node.js. | This is *the* standard way to keep secrets (like the Gemini API key) out of your actual source code. |
| **jsPDF** | A JavaScript library that generates PDF files directly in the browser. | Lets the Report page create a downloadable PDF without needing any backend PDF-generation logic — keeps the project simpler. |
| **Google Gemini API** | Google's generative AI model, accessed over HTTPS via a REST API. | Used only for the "Explain Why" feature, to turn structured findings into natural-language explanations for beginners. |
| **Plain CSS with CSS variables** | Standard styling, no framework. | Chosen deliberately over Tailwind CSS to keep the project's *dependencies* minimal and easy to fully understand — every style rule is visible and explainable, nothing "generated" by a utility framework. |

### 4.1 How does the tech stack itself contribute to security (not just the scanning logic)?

This is an important distinction for your viva: **some security comes
from what the app *checks*, and some comes from how the app *itself* is
built.** Examples of the second kind, present in this project:

1. **CORS** — explicitly restricts which origins can call the backend
   (see above).
2. **Environment variables + `.gitignore`** — prevents secret leakage.
3. **Server-side-only API key usage** — the Gemini key never reaches
   the browser (see Part 6).
4. **Input validation** — every backend route checks `if (!url) return
   res.status(400)...` before doing anything, so bad/missing input
   can't crash the server.
5. **`validateStatus: () => true` in Axios calls** — this one is subtle
   but important: by default, Axios treats any non-2xx response (like a
   403 or 429) as an *error* and throws an exception. For a security
   scanner, a 403 or 429 is not a bug — it's a *valid, expected*
   response we need to inspect! Overriding this behavior lets the
   scanner safely observe *any* status code without crashing.
6. **Global error handler in `server.js`** — guarantees that even an
   unexpected bug won't take down the whole backend or leak an internal
   stack trace to the user.
7. **Timeouts on every request** (`timeout: 5000` or `15000`) — prevents
   the scanner from hanging forever if a target API never responds,
   which is itself a (very minor) denial-of-service protection for the
   scanner tool itself.

---

## PART 5 — THE SECURITY SCORE METHODOLOGY

```
Score starts at 100
For every finding that is NOT a clean "PASS":
    CRITICAL → subtract 25
    HIGH     → subtract 20
    MEDIUM   → subtract 10
    LOW      → subtract 5
    INFO     → subtract 0
Final score is clamped between 0 and 100

Risk Level:
    90–100 → Excellent
    75–89  → Good
    50–74  → Medium
    0–49   → Poor
```

**Why this simple additive/subtractive model instead of something more
"scientific"?** Because:
1. It's easy to explain and defend in a viva — anyone can verify the
   math by hand.
2. Real-world vulnerability scoring systems (like **CVSS — Common
   Vulnerability Scoring System**, the industry standard) are far more
   complex, factoring in exploitability, impact, and more. This
   simplified model is a deliberately beginner-appropriate stand-in that
   captures the *idea* of CVSS (worse issues cost more points) without
   the complexity.
3. It naturally produces a single, easy-to-understand number, which is
   important for a *dashboard* — the whole point of a security dashboard
   is to let someone judge overall health at a glance.

---

## PART 6 — AI INTEGRATION SECURITY (THE "EXPLAIN WHY" FEATURE)

This is one of the most important security concepts in the entire
project, and one you should be ready to explain clearly:

### 6.1 Why must the Gemini API key live only on the backend?

Anything shipped inside a React app — including any `.env` variable
prefixed for the frontend, or any hardcoded string — is downloaded to
the user's browser as plain JavaScript. **Anyone can open browser
DevTools, view the source, and read it.** If the Gemini key were placed
in the frontend, *anyone visiting the site* could steal it and use your
API quota (or run up your bill, if billing is enabled).

### 6.2 How the project enforces this

```
[Browser]                [Backend Server]              [Google Gemini]
ExplainWhy.jsx  --POST-->  aiController.js  --HTTPS-->   Gemini API
                (no key)   (reads key from
                            process.env,
                            which is only
                            ever loaded
                            server-side)
```

The frontend only ever sends the **finding data** (name, evidence,
severity, etc. — nothing secret) to the backend. The backend is the
**only** place `process.env.GEMINI_API_KEY` is ever read, and that
value never gets included in any response sent back to the browser.
This pattern — "never trust the client, keep secrets server-side" — is
one of the most fundamental rules in all of web security, and this
project is a working example of applying it correctly.

### 6.3 Why must the app work even if Gemini fails?

Because a security tool that **crashes** when a *third-party, optional*
service goes down is badly designed — imagine a real security scanner
that couldn't produce *any* report just because an AI feature timed
out! This is why `aiController.js` wraps the entire Gemini call in a
`try/catch` and, on **any** failure (missing key, network error, quota
exceeded, malformed response), returns a normal `200 OK` response with
`available: false` and a friendly fallback message — the rule-based
explanation and recommendation are always there as a safety net. This
concept is sometimes called **graceful degradation**: a system should
lose *some* features under failure, not *all* of them.

---

## PART 7 — ERROR HANDLING PHILOSOPHY (ACROSS THE WHOLE APP)

A recurring theme throughout this project, worth stating explicitly in
a viva: **nothing the user does should be able to crash the app.**

- Invalid/missing URL → backend returns `400 Bad Request` with a clear
  message, instead of throwing an unhandled exception.
- Target API unreachable/times out → each scanner module catches the
  error and returns a `WARNING` result explaining what happened, instead
  of failing the whole scan.
- Non-JSON response → `sensitiveDataCheck.js` checks `typeof data !==
  "object"` and returns a graceful `PASS` (nothing to inspect) rather
  than crashing while trying to read fields from something that isn't
  an object.
- Gemini failure → handled as described in Part 6.
- Any unexpected server error → caught by the global error handler in
  `server.js`.
- Frontend network failure (backend not running) → `api.js`'s
  `safeCall()` wrapper catches it and every page shows a friendly
  `notice` box instead of a blank crash screen.

---

## PART 8 — LIMITATIONS (IMPORTANT TO STATE HONESTLY IN A VIVA)

Being upfront about limitations is itself good security/engineering
practice — overclaiming what a tool can do is a real-world problem with
some security products. This project is careful to never claim more
than it can prove:

- It is a **beginner-level educational tool**, not a replacement for
  professional penetration-testing tools (like Burp Suite, OWASP ZAP,
  or a real professional security audit).
- It performs **no** brute-force attacks, flooding, denial-of-service
  testing, destructive requests, database attacks, or aggressive
  fuzzing.
- The BOLA test only checks **one** neighboring ID — a determined
  attacker might try many more, so a `PASS` here doesn't guarantee
  total safety, only that *this specific, limited test* didn't find a
  problem.
- The rate-limit test only sends **5** requests — it can prove a limit
  *exists* if triggered, but can never prove a limit *doesn't* exist,
  since a real limit might only kick in after hundreds of requests.
- All findings are worded conservatively — `POTENTIAL VULNERABILITY`,
  not `CONFIRMED VULNERABILITY` — because a small number of controlled
  requests can never provide the level of certainty a full audit would.

---

## PART 9 — QUICK-REFERENCE CHEAT SHEET FOR YOUR VIVA

**"What does your project do?"**
> It's a small dashboard that sends a few safe, controlled test requests
> to a REST API and checks it for four common weaknesses — BOLA,
> property-level authorization issues, sensitive data exposure, and
> missing rate limiting — then explains each finding using both a
> rule-based system and Google's Gemini AI.

**"Why three separate servers?"**
> To separate the UI (React), the testing logic (Node/Express backend),
> and the target being tested (the demo API) — this mirrors how real
> security tools are structured, and keeps the Gemini API key safely
> isolated on the backend.

**"How do you avoid actually attacking anything?"**
> Every test is capped to the smallest possible number of requests
> needed to demonstrate the concept — one neighboring ID for BOLA, one
> property-change attempt, one read for sensitive data, and a maximum
> of five requests for rate limiting.

**"How is the Gemini key kept safe?"**
> It's stored in a `.env` file that's excluded from Git via
> `.gitignore`, read only inside the backend using the `dotenv`
> package, and never sent to or exposed in the frontend/browser.

**"What happens if Gemini fails?"**
> The backend catches the failure and returns a friendly fallback
> message along with the rule-based explanation — the app never
> crashes and always has something useful to show.

**"How is the score calculated?"**
> Starting from 100, each non-PASS finding subtracts points based on
> severity (Critical -25, High -20, Medium -10, Low -5), clamped
> between 0–100, then mapped to a risk label (Excellent/Good/Medium/Poor).
