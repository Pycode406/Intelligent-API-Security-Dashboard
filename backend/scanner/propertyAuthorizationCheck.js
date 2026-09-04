/**
 * propertyAuthorizationCheck.js
 * ------------------------------
 * Tests for Broken Object Property Level Authorization (OWASP API3).
 *
 * The scanner sends a single controlled PUT/PATCH-style request that
 * attempts to set a restricted property (default: "role" = "admin")
 * on the target endpoint, and observes whether the API accepts it.
 */

const axios = require("axios");

async function checkPropertyAuthorization(
  targetUrl,
  property = "role",
  value = "admin"
) {
  const body = { [property]: value };

  let status = null;
  let responseData = null;

  try {
    const response = await axios.put(targetUrl, body, {
      validateStatus: () => true,
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
    });
    status = response.status;
    responseData = response.data;
  } catch (err) {
    return {
      name: "Property Authorization",
      status: "WARNING",
      severity: "LOW",
      owasp: "API3 - Broken Object Property Level Authorization",
      evidence: `Could not complete the property authorization test: ${err.message}`,
      recommendation: "Verify the API URL is reachable and try again.",
      explanation: "A network or connection error prevented this test from completing.",
    };
  }

  const evidence =
    `Request: PUT ${targetUrl} with body { "${property}": "${value}" } -> ${status}.`;

  if (status === 200 || status === 201) {
    return {
      name: "Property Authorization",
      status: "POTENTIAL VULNERABILITY",
      severity: "HIGH",
      owasp: "API3 - Broken Object Property Level Authorization",
      evidence:
        evidence +
        ` The restricted property "${property}" appears to have been accepted.`,
      recommendation:
        "Explicitly allow-list which fields a user is permitted to modify " +
        "and reject requests that attempt to change protected fields such " +
        "as role or permissions on the server side.",
      explanation:
        "The API accepted a change to a property that should typically be " +
        "restricted to privileged users or administrators.",
      requestDetails: { targetUrl, property, value, status },
    };
  }

  return {
    name: "Property Authorization",
    status: "PASS",
    severity: "INFO",
    owasp: "API3 - Broken Object Property Level Authorization",
    evidence:
      evidence +
      ` The restricted property "${property}" was rejected (status ${status}).`,
    recommendation: "No action needed. Continue enforcing property-level checks.",
    explanation:
      "The API correctly rejected an attempt to modify a restricted property.",
    requestDetails: { targetUrl, property, value, status },
  };
}

module.exports = { checkPropertyAuthorization };
