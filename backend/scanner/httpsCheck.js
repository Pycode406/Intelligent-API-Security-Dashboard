/**
 * httpsCheck.js
 * -------------
 * Checks whether the target API URL uses HTTPS.
 * This is a simple, non-invasive check based only on the URL scheme.
 */

const { getRecommendation } = require("../utils/recommendations");

function checkHttps(targetUrl) {
  const isHttps = targetUrl.trim().toLowerCase().startsWith("https://");

  if (isHttps) {
    return {
      name: "HTTPS",
      status: "PASS",
      severity: "INFO",
      owasp: "General Security Best Practice",
      evidence: "The target URL uses the https:// scheme.",
      recommendation: "No action needed. Continue enforcing HTTPS.",
      explanation:
        "HTTPS encrypts data in transit between the client and the API, " +
        "protecting it from interception and tampering.",
    };
  }

  return {
    name: "HTTPS",
    status: "WARNING",
    severity: "MEDIUM",
    owasp: "General Security Best Practice",
    evidence: "The target URL does not use the https:// scheme.",
    recommendation: getRecommendation("HTTPS"),
    explanation:
      "Without HTTPS, data sent between the client and the API " +
      "(including credentials) can potentially be intercepted on the network.",
  };
}

module.exports = { checkHttps };
