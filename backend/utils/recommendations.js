/**
 * recommendations.js
 * -------------------
 * Simple rule-based (non-AI) recommendations used as a fallback and
 * as the default "Recommended Fix" text shown alongside each result.
 * These are used even if the Gemini AI explanation is unavailable.
 */

const RECOMMENDATIONS = {
  BOLA:
    "Implement server-side object-level authorization. Always verify " +
    "that the currently authenticated user is allowed to access the " +
    "specific object being requested, rather than trusting the ID in " +
    "the URL.",
  PROPERTY_AUTHORIZATION:
    "Explicitly allow-list which fields a user is permitted to modify " +
    "(e.g. name, email) and reject any request that attempts to change " +
    "protected fields such as role or permissions on the server side.",
  SENSITIVE_DATA:
    "Avoid returning sensitive fields (passwords, tokens, API keys, " +
    "secrets) in API responses. Use response DTOs / serializers that " +
    "only include fields that are safe for the client to see.",
  RATE_LIMIT:
    "Add rate limiting (e.g. per-IP or per-user request throttling) " +
    "and return HTTP 429 Too Many Requests once a reasonable threshold " +
    "is exceeded, to protect against resource exhaustion.",
  HTTPS:
    "Serve the API only over HTTPS (TLS) so that data in transit is " +
    "encrypted and cannot be intercepted or tampered with.",
  SECURITY_HEADERS:
    "Add standard security headers such as Content-Security-Policy, " +
    "X-Content-Type-Options, Strict-Transport-Security, and " +
    "X-Frame-Options to reduce common web attack surfaces.",
  AUTHENTICATION:
    "Ensure protected endpoints require a valid authentication " +
    "credential (e.g. a token or session) and reject unauthenticated " +
    "requests.",
};

function getRecommendation(key) {
  return (
    RECOMMENDATIONS[key] ||
    "Review this finding against OWASP API Security best practices."
  );
}

module.exports = { getRecommendation, RECOMMENDATIONS };
