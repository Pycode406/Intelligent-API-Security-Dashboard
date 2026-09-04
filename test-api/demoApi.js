/**
 * =====================================================================
 * LOCAL DEMO / TEST API — FOR EDUCATIONAL TESTING ONLY
 * =====================================================================
 * This API is NOT a real production API. It exists only so that the
 * "Intelligent API Security Testing Dashboard" college project has a
 * safe, predictable target to scan during demonstrations.
 *
 * It intentionally contains BOTH:
 *   - "secure"     endpoints  -> should produce PASS results
 *   - "vulnerable" endpoints  -> should produce WARNING / POTENTIAL
 *                                 VULNERABILITY results
 *
 * No real user data, no destructive actions, no real secrets.
 * All "sensitive" values below are fake demo values only.
 * =====================================================================
 */

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ---------------------------------------------------------------------
// In-memory demo "database" of fake users. Not real data.
// ---------------------------------------------------------------------
const demoUsers = {
  101: {
    id: 101,
    name: "Alice",
    email: "alice@example.com",
    role: "user",
    // fake demo secrets only — never real credentials
    password: "demoPassword123",
    apiKey: "DEMO-API-12345",
  },
  102: {
    id: 102,
    name: "Bob",
    email: "bob@example.com",
    role: "user",
    password: "demoPassword456",
    apiKey: "DEMO-API-67890",
  },
};

// Helper: return a "safe" (public) version of a user, without secrets.
function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// =======================================================================
// A. BOLA (Broken Object Level Authorization) DEMO ENDPOINTS
// =======================================================================

/**
 * SECURE BOLA ENDPOINT
 * Simulates an API that checks whether the requester "owns" the object.
 * For this demo, we simulate the "logged-in user" as always being 101.
 * Any other object id is rejected with 403 Forbidden.
 */
app.get("/api/secure/users/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const loggedInUserId = 101; // simulated authenticated user for the demo

  const user = demoUsers[requestedId];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (requestedId !== loggedInUserId) {
    return res.status(403).json({
      message: "Forbidden: you are not authorized to access this object.",
    });
  }

  return res.status(200).json(toPublicUser(user));
});

/**
 * VULNERABLE BOLA ENDPOINT
 * Intentionally does NOT check object ownership.
 * Any object id returns data, demonstrating a Broken Object Level
 * Authorization (BOLA) weakness for the scanner to detect.
 */
app.get("/api/vulnerable/users/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const user = demoUsers[requestedId];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Intentionally vulnerable: no ownership / authorization check.
  return res.status(200).json(toPublicUser(user));
});

// =======================================================================
// B. PROPERTY-LEVEL AUTHORIZATION DEMO ENDPOINTS
// =======================================================================

// Properties a normal user is NOT allowed to set themselves.
const RESTRICTED_PROPERTIES = ["role"];

/**
 * SECURE property authorization endpoint.
 * Rejects updates that try to set restricted properties (e.g. "role").
 */
app.put("/api/secure/users/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const user = demoUsers[requestedId];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const attemptedFields = Object.keys(req.body || {});
  const restrictedAttempt = attemptedFields.find((field) =>
    RESTRICTED_PROPERTIES.includes(field)
  );

  if (restrictedAttempt) {
    return res.status(403).json({
      message: `Forbidden: property "${restrictedAttempt}" cannot be modified by this user.`,
    });
  }

  // Allow safe fields only (demo purposes, does not persist).
  return res.status(200).json({
    message: "Profile updated (demo only, not persisted).",
    updated: req.body,
  });
});

/**
 * VULNERABLE property authorization endpoint.
 * Intentionally allows ANY property to be updated, including "role",
 * demonstrating Broken Object Property Level Authorization.
 */
app.put("/api/vulnerable/users/:id", (req, res) => {
  const requestedId = Number(req.params.id);
  const user = demoUsers[requestedId];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Intentionally vulnerable: no restricted-property check at all.
  return res.status(200).json({
    message: "Profile updated (demo only, not persisted).",
    updated: req.body,
  });
});

// =======================================================================
// C. SENSITIVE DATA EXPOSURE DEMO ENDPOINTS
// =======================================================================

/**
 * SECURE profile endpoint — returns only safe public fields.
 */
app.get("/api/secure/profile", (req, res) => {
  const user = demoUsers[101];
  return res.status(200).json(toPublicUser(user));
});

/**
 * VULNERABLE profile endpoint — intentionally includes fake sensitive
 * fields (password, apiKey) to demonstrate Sensitive Data Exposure
 * detection. Values are fake demo values only.
 */
app.get("/api/vulnerable/profile", (req, res) => {
  const user = demoUsers[101];
  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    apiKey: user.apiKey,
  });
});

// =======================================================================
// D. RATE LIMITING DEMO ENDPOINTS
// =======================================================================

// Simple in-memory request counters (reset when the server restarts).
// This is a DEMO ONLY mechanism, not a production rate limiter.
let secureProductsRequestCount = 0;
let vulnerableProductsRequestCount = 0;

const demoProducts = [
  { id: 1, name: "Demo Widget" },
  { id: 2, name: "Demo Gadget" },
];

/**
 * SECURE products endpoint — simulates rate limiting.
 * The first 3 requests succeed; from the 4th request onward it
 * returns 429 Too Many Requests. Counter resets after 30 seconds
 * of inactivity so repeated demos keep working.
 */
let secureLastRequestTime = Date.now();
app.get("/api/secure/products", (req, res) => {
  const now = Date.now();
  if (now - secureLastRequestTime > 30000) {
    secureProductsRequestCount = 0; // reset window for repeatable demos
  }
  secureLastRequestTime = now;
  secureProductsRequestCount += 1;

  if (secureProductsRequestCount > 3) {
    return res.status(429).json({
      message: "Too Many Requests. Please slow down.",
    });
  }
  return res.status(200).json(demoProducts);
});

/**
 * VULNERABLE products endpoint — intentionally has NO rate limiting.
 * Always returns 200, even for repeated requests.
 */
app.get("/api/vulnerable/products", (req, res) => {
  vulnerableProductsRequestCount += 1;
  return res.status(200).json(demoProducts);
});

// =======================================================================
// Root info route
// =======================================================================
app.get("/", (req, res) => {
  res.json({
    message: "Local Demo/Test API — For Educational Testing Only",
    endpoints: {
      bola: {
        secure: "/api/secure/users/101",
        vulnerable: "/api/vulnerable/users/101",
      },
      propertyAuthorization: {
        secure: "PUT /api/secure/users/101",
        vulnerable: "PUT /api/vulnerable/users/101",
      },
      sensitiveData: {
        secure: "/api/secure/profile",
        vulnerable: "/api/vulnerable/profile",
      },
      rateLimit: {
        secure: "/api/secure/products",
        vulnerable: "/api/vulnerable/products",
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Local Demo/Test API running at http://localhost:${PORT}`);
  console.log("FOR EDUCATIONAL TESTING ONLY — do not use in production.");
});
