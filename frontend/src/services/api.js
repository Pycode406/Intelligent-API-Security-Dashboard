/**
 * api.js
 * -------
 * Centralized Axios instance and API call helpers for talking to the
 * Security Scanner Backend at http://localhost:5001.
 */

import axios from "axios";

const BACKEND_URL = "http://localhost:5001";

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
});

// Wraps a call in a try/catch so pages get a consistent error shape.
async function safeCall(fn) {
  try {
    const response = await fn();
    return { ok: true, data: response.data };
  } catch (err) {
    const message =
      (err.response && err.response.data && err.response.data.error) ||
      err.message ||
      "Something went wrong while contacting the backend.";
    return { ok: false, error: message };
  }
}

export function runFullScan(url) {
  return safeCall(() => api.post("/api/scan", { url }));
}

export function runBolaTest(url) {
  return safeCall(() => api.post("/api/scan/bola", { url }));
}

export function runPropertyTest(url, property, value) {
  return safeCall(() =>
    api.post("/api/scan/property-authorization", { url, property, value })
  );
}

export function runSensitiveDataTest(url) {
  return safeCall(() => api.post("/api/scan/sensitive-data", { url }));
}

export function runRateLimitTest(url) {
  return safeCall(() => api.post("/api/scan/rate-limit", { url }));
}

export function explainFinding(finding) {
  return safeCall(() => api.post("/api/explain", finding));
}

export default api;
