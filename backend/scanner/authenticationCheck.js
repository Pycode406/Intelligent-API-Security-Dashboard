/**
 * authenticationCheck.js
 * -----------------------
 * A very simple, non-invasive check for basic authentication
 * indicators. This does NOT attempt to bypass authentication or
 * perform credential attacks — it only observes response signals.
 */

const { getRecommendation } = require("../utils/recommendations");

function checkAuthentication(statusCode, responseHeaders) {
  const headers = responseHeaders || {};
  const hasAuthChallenge = Boolean(headers["www-authenticate"]);
  const isUnauthorized = statusCode === 401 || statusCode === 403;

  if (isUnauthorized || hasAuthChallenge) {
    return {
      name: "Authentication Indicator",
      status: "PASS",
      severity: "INFO",
      owasp: "OWASP API2 - Broken Authentication (context)",
      evidence: `The endpoint responded with status ${statusCode}${
        hasAuthChallenge ? " and a WWW-Authenticate header" : ""
      }, suggesting an authentication mechanism is present.`,
      recommendation: "No action needed for this indicator.",
      explanation:
        "A 401/403 response or an authentication challenge header suggests " +
        "the endpoint expects credentials, which is a good baseline sign.",
    };
  }

  return {
    name: "Authentication Indicator",
    status: "WARNING",
    severity: "LOW",
    owasp: "OWASP API2 - Broken Authentication (context)",
    evidence:
      "No authentication challenge or 401/403 response was observed " +
      "for this request.",
    recommendation: getRecommendation("AUTHENTICATION"),
    explanation:
      "This is only a weak signal — many valid public endpoints do not " +
      "require authentication. It does not confirm broken authentication " +
      "on its own.",
  };
}

module.exports = { checkAuthentication };
