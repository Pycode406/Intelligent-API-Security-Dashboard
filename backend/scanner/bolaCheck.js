/**
 * bolaCheck.js
 * ------------
 * Tests for Broken Object Level Authorization (OWASP API1).
 *
 * How it works (controlled, non-destructive):
 * 1. The scanner requests the URL exactly as provided by the user
 *    (the "original" object).
 * 2. It then tries ONE nearby numeric object ID (id + 1) on the same
 *    path, to see if a *different* object is also accessible.
 * 3. If the second request also returns 200 with data, this is
 *    reported as a "Potential BOLA" (not a confirmed vulnerability).
 * 4. If the second request is denied (401/403/404), it is reported
 *    as PASS.
 *
 * This never attempts brute-forcing beyond a single adjacent ID.
 */

const axios = require("axios");

// Finds a trailing numeric ID in the URL path, e.g. .../users/101
function findTrailingId(url) {
  const match = url.match(/(\d+)(\/?)(\?.*)?$/);
  if (!match) return null;
  return {
    id: match[1],
    index: match.index,
    length: match[1].length,
  };
}

async function checkBola(targetUrl) {
  const idInfo = findTrailingId(targetUrl);

  if (!idInfo) {
    return {
      name: "BOLA",
      status: "WARNING",
      severity: "LOW",
      owasp: "API1 - Broken Object Level Authorization",
      evidence:
        "No numeric object ID was found at the end of the URL, so the " +
        "BOLA object-comparison test could not be performed.",
      recommendation:
        "Provide a URL that ends in a numeric object ID (e.g. /users/101) " +
        "to run the BOLA test.",
      explanation:
        "This test relies on comparing access to two different numeric object IDs.",
    };
  }

  const originalId = Number(idInfo.id);
  const nextId = originalId + 1;
  const testUrl =
    targetUrl.slice(0, idInfo.index) +
    String(nextId) +
    targetUrl.slice(idInfo.index + idInfo.length);

  let originalStatus = null;
  let testStatus = null;
  let testReturnedData = false;

  try {
    const originalResponse = await axios.get(targetUrl, {
      validateStatus: () => true,
      timeout: 5000,
    });
    originalStatus = originalResponse.status;
  } catch (err) {
    return buildErrorResult(err);
  }

  try {
    const testResponse = await axios.get(testUrl, {
      validateStatus: () => true,
      timeout: 5000,
    });
    testStatus = testResponse.status;
    testReturnedData =
      testResponse.status === 200 &&
      testResponse.data !== null &&
      typeof testResponse.data === "object";
  } catch (err) {
    return buildErrorResult(err);
  }

  const evidence =
    `Original Request: GET ${targetUrl} -> ${originalStatus}. ` +
    `Test Request: GET ${testUrl} -> ${testStatus}.`;

  if (testStatus === 200 && testReturnedData) {
    return {
      name: "BOLA",
      status: "POTENTIAL VULNERABILITY",
      severity: "HIGH",
      owasp: "API1 - Broken Object Level Authorization",
      evidence:
        evidence +
        " Changing the object ID returned another accessible object " +
        "without an authorization denial.",
      recommendation:
        "Implement server-side object-level authorization. Always verify " +
        "that the currently authenticated user is authorized to access the " +
        "specific object being requested.",
      explanation:
        "The API may not be checking whether the current user is authorized " +
        "to access the requested object.",
      requestDetails: { originalUrl: targetUrl, originalStatus, testUrl, testStatus },
    };
  }

  return {
    name: "BOLA",
    status: "PASS",
    severity: "INFO",
    owasp: "API1 - Broken Object Level Authorization",
    evidence:
      evidence +
      " Access to the neighboring object ID was denied or unavailable.",
    recommendation: "No action needed. Continue enforcing object-level checks.",
    explanation:
      "The API correctly rejected or did not return data for a different " +
      "object ID, consistent with proper object-level authorization.",
    requestDetails: { originalUrl: targetUrl, originalStatus, testUrl, testStatus },
  };
}

function buildErrorResult(err) {
  return {
    name: "BOLA",
    status: "WARNING",
    severity: "LOW",
    owasp: "API1 - Broken Object Level Authorization",
    evidence: `Could not complete the BOLA test: ${err.message}`,
    recommendation: "Verify the API URL is reachable and try again.",
    explanation: "A network or connection error prevented this test from completing.",
  };
}

module.exports = { checkBola };
