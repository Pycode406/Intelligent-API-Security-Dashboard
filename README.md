# Intelligent API Security Testing Dashboard

A System that demonstrates how REST
APIs can be checked for a focused set of common API security weaknesses,
in a safe and controlled way.

For every result the app shows: **Detection → Evidence → Explanation →
OWASP Mapping → Recommendation**, plus an **"Explain Why"** button powered
by the Gemini API (with a rule-based fallback if Gemini is unavailable).

>  **Local Demo/Test API — For Educational Testing Only**
> The `test-api/` folder is a small Express server built ONLY to give this
> project a safe, predictable target to scan during demonstrations. It
> contains fake demo data, performs no destructive actions, and must not
> be treated as a real production API.

> Only scan APIs that you own or are explicitly authorized to test.

---

## 1. Project Structure

```
Intelligent-API-Security-Dashboard/
├── frontend/        React + Vite dashboard (http://localhost:5173)
├── backend/         Node/Express scanner backend (http://localhost:5001)
├── test-api/        Local Demo/Test API (http://localhost:5000)
├── reports/         (optional) place to keep exported PDF reports
├── .gitignore
└── README.md
```

Data flow:

```
React Frontend (5173) → Security Scanner Backend (5001) → Demo API (5000)
```

---

## 2. Installation

You need **Node.js** (v18+) installed.

### 2.1 Install the Demo API
```bash
cd test-api
npm install
```

### 2.2 Install the Backend
```bash
cd backend
npm install
```

### 2.3 Install the Frontend
```bash
cd frontend
npm install
```

---

## 3. Gemini API Key Configuration

The Gemini key is used **only by the backend**, never by the frontend.

1. Get a Gemini API key from Google AI Studio.
2. Open `backend/.env` (already created from `backend/.env.example`).
3. Replace the placeholder:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

with your real key.

If you skip this step, the app still works — "Explain Why" will show:
*"AI explanation is currently unavailable. The rule-based explanation and
recommendation are still available."*

`backend/.env` is listed in `.gitignore` and must never be committed with
a real key.

---

## 4. Running the Project

Open **three terminals**.

**Terminal 1 — Demo API**
```bash
cd test-api
npm start
# Running at http://localhost:5000
```

**Terminal 2 — Backend**
```bash
cd backend
npm start
# Running at http://localhost:5001
```

**Terminal 3 — Frontend**
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 5. Exact Demo Endpoints

### BOLA
- Secure: `http://localhost:5000/api/secure/users/101`
- Vulnerable: `http://localhost:5000/api/vulnerable/users/101`

### Property Authorization (PUT request, property=`role`, value=`admin`)
- Secure: `http://localhost:5000/api/secure/users/101`
- Vulnerable: `http://localhost:5000/api/vulnerable/users/101`

### Sensitive Data
- Secure: `http://localhost:5000/api/secure/profile`
- Vulnerable: `http://localhost:5000/api/vulnerable/profile`

### Rate Limiting
- Secure: `http://localhost:5000/api/secure/products`
- Vulnerable: `http://localhost:5000/api/vulnerable/products`

---

## 6. Step-by-Step Demonstration Procedure

For each of the four vulnerabilities, follow this flow:

```
SECURE ENDPOINT → PASS → VULNERABLE ENDPOINT → POTENTIAL VULNERABILITY 
      → Explain Why → Gemini Explanation → Recommendation
```

1. Go to the relevant test page (`BOLA Test`, `Property Test`,
   `Sensitive Data`, or `Rate Limit`) via the navbar.
2. Paste the **secure** demo URL and run the test → observe **PASS**.
3. Paste the **vulnerable** demo URL and run the test → observe
   **POTENTIAL VULNERABILITY** (or **WARNING** for rate limiting).
4. Click **Explain Why** to get a Gemini-generated, beginner-friendly
   explanation (or the rule-based fallback if Gemini isn't configured).
5. Read the **Recommendation** shown on the card.
6. Repeat for all four vulnerabilities, then visit `/dashboard`, run a
   **full scan** against any of the demo URLs, and open `/report` to
   download a **PDF report** of the results.

---

## 7. How "Explain Why" Works

```
Explain Why (frontend button)
        ↓
POST /api/explain  (to the backend)
        ↓
Node.js backend builds a prompt from the finding
        ↓
Backend calls the Gemini API using GEMINI_API_KEY (server-side only)
        ↓
Gemini's explanation is returned to the backend
        ↓
Backend sends it back to the React UI
        ↓
UI shows "Why was this flagged?" and "Recommended Fix"
```

If the key is missing, the request fails, or the network is unavailable,
the backend **never crashes** — it returns a friendly fallback message and
the rule-based explanation/recommendation instead.

---

## 8. Generating the PDF Report

1. Run a full scan from the **Dashboard** page.
2. Go to the **Report** page.
3. Click **Download PDF Report** — this uses `jsPDF` in the browser to
   generate a PDF containing the target API, timestamp, score, risk
   level, and all findings with evidence and recommendations.

---

## 9. Important Limitations & Security Precautions

This project is a **controlled, beginner-level API security assessment
tool** — it is **NOT** a replacement for professional penetration-testing
tools. It intentionally does **not** perform:

- Brute-force or credential attacks
- Request flooding or denial-of-service testing
- Destructive requests
- Database attacks
- Arbitrary code execution
- Aggressive fuzzing

The rate-limit test sends a **maximum of 5 requests**. The BOLA test only
checks a single neighboring object ID. Findings are reported as `PASS`,
`WARNING`, or `POTENTIAL VULNERABILITY` — never as an automatically
"confirmed" vulnerability, since a lightweight scanner cannot provide
that level of certainty.

**Only scan APIs that you own or have explicit permission to test.**

---

## 10. Technologies Used

- **Frontend:** React, Vite, React Router, Axios, jsPDF, plain CSS
- **Backend:** Node.js, Express, Axios, CORS, dotenv
- **Demo API:** Node.js, Express
- **AI:** Google Gemini API (called only from the backend)


