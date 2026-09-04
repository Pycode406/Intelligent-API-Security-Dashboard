/**
 * sensitiveDataCheck.js
 * -----------------------
 * Sends a single GET request and inspects the JSON response body for
 * field NAMES that commonly indicate sensitive data. It never displays
 * the actual sensitive VALUES in the UI — those are always masked.
 *
 * Note: Sensitive Data Exposure is NOT a standalone OWASP API Security
 * Top 10 2023 category on its own — it overlaps with categories such as
 * Broken Object/Property Level Authorization and unsafe API responses.
 * This is reflected in the "owasp" field below.
 */

const axios = require("axios");

const SUSPICIOUS_FIELDS = [
  "password",
  "passwd",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "secret",
  "privatekey",
  "creditcard",
  "cardnumber",
  "cvv",
  "ssn",
];

// Recursively collect suspicious field names found anywhere in the object.
function findSuspiciousFields(obj, found = new Set()) {
  if (!obj || typeof obj !== "object") return found;

  Object.keys(obj).forEach((key) => {
    const normalizedKey = key.toLowerCase();
    if (SUSPICIOUS_FIELDS.includes(normalizedKey)) {
      found.add(key);
    }
    const value = obj[key];
    if (value && typeof value === "object") {
      findSuspiciousFields(value, found);
    }
  });

  return found;
}

async function checkSensitiveData(targetUrl) {
  let status = null;
  let data = null;

  try {
    const response = await axios.get(targetUrl, {
      validateStatus: () => true,
      timeout: 5000,
    });
    status = response.status;
    data = response.data;
  } catch (err) {
    return {
      name: "Sensitive Data",
      status: "WARNING",
      severity: "LOW",
      owasp:
        "Overlaps with API1/API3 (Object/Property Level Authorization) " +
        "and general unsafe API response design",
      evidence: `Could not complete the sensitive data test: ${err.message}`,
      recommendation: "Verify the API URL is reachable and try again.",
      explanation: "A network or connection error prevented this test from completing.",
    };
  }

  if (typeof data !== "object" || data === null) {
    return {
      name: "Sensitive Data",
      status: "PASS",
      severity: "INFO",
      owasp:
        "Overlaps with API1/API3 (Object/Property Level Authorization) " +
        "and general unsafe API response design",
      evidence: `Response (status ${status}) was not a JSON object; no fields to inspect.`,
      recommendation: "No action needed.",
      explanation: "The response body was not structured JSON, so no field-based check applied.",
    };
  }

  const foundFields = Array.from(findSuspiciousFields(data));
  // Build masked evidence — never show the actual values.
  const maskedEvidence = foundFields.map((f) => `${f} -> [HIDDEN]`);

  if (foundFields.length > 0) {
    return {
      name: "Sensitive Data",
      status: "POTENTIAL VULNERABILITY",
      severity: "HIGH",
      owasp:
        "Overlaps with API1/API3 (Object/Property Level Authorization) " +
        "and general unsafe API response design",
      evidence:
        `The response (status ${status}) contained fields that look sensitive: ` +
        maskedEvidence.join(", ") +
        ". Actual values are masked and never displayed.",
      recommendation:
        "Avoid returning sensitive fields (passwords, tokens, API keys, " +
        "secrets) in API responses. Use response DTOs / serializers that " +
        "only include fields that are safe for the client.",
      explanation:
        "Field names matching common sensitive-data patterns were found in " +
        "the JSON response body.",
      requestDetails: { targetUrl, status, suspiciousFields: foundFields },
    };
  }

  return {
    name: "Sensitive Data",
    status: "PASS",
    severity: "INFO",
    owasp:
      "Overlaps with API1/API3 (Object/Property Level Authorization) " +
      "and general unsafe API response design",
    evidence: `The response (status ${status}) did not contain any recognized sensitive field names.`,
    recommendation: "No action needed. Continue reviewing responses periodically.",
    explanation:
      "No field names matching common sensitive-data patterns were found. " +
      "This does not guarantee the absence of all sensitive data.",
    requestDetails: { targetUrl, status, suspiciousFields: [] },
  };
}

module.exports = { checkSensitiveData };
