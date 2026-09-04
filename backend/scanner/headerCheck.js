/**
 * headerCheck.js
 * --------------
 * Inspects a small set of common security-related HTTP response
 * headers. Missing headers are reported as WARNING, not as confirmed
 * vulnerabilities, since header requirements vary by application.
 */

const { getRecommendation } = require("../utils/recommendations");

const HEADERS_TO_CHECK = [
  "content-security-policy",
  "x-content-type-options",
  "strict-transport-security",
  "x-frame-options",
];

function checkHeaders(responseHeaders) {
  const headers = responseHeaders || {};
  const missing = HEADERS_TO_CHECK.filter((h) => !headers[h]);

  if (missing.length === 0) {
    return {
      name: "Security Headers",
      status: "PASS",
      severity: "INFO",
      owasp: "General Security Best Practice",
      evidence: "All checked security headers were present in the response.",
      recommendation: "No action needed.",
      explanation:
        "Security headers such as CSP and HSTS help protect against " +
        "common browser-based attacks like clickjacking and content sniffing.",
    };
  }

  return {
    name: "Security Headers",
    status: "WARNING",
    severity: "LOW",
    owasp: "General Security Best Practice",
    evidence: `The following headers were missing: ${missing.join(", ")}.`,
    recommendation: getRecommendation("SECURITY_HEADERS"),
    explanation:
      "Missing security headers do not always mean an API is unsafe, " +
      "but adding them is a low-effort way to reduce common web attack surfaces.",
  };
}

module.exports = { checkHeaders };
