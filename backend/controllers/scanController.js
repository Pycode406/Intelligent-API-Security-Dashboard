/**
 * scanController.js
 * -------------------
 * Coordinates the full "Start Security Scan" flow used by the
 * Dashboard page, and the individual test endpoints used by the
 * dedicated BOLA / Property / Sensitive Data / Rate Limit pages.
 */

const axios = require("axios");
const { checkHttps } = require("../scanner/httpsCheck");
const { checkHeaders } = require("../scanner/headerCheck");
const { checkAuthentication } = require("../scanner/authenticationCheck");
const { checkBola } = require("../scanner/bolaCheck");
const { checkPropertyAuthorization } = require("../scanner/propertyAuthorizationCheck");
const { checkSensitiveData } = require("../scanner/sensitiveDataCheck");
const { checkRateLimit } = require("../scanner/rateLimitCheck");
const { calculateScore, getRiskLevel } = require("../utils/calculateScore");

// Runs ALL checks for the main Dashboard "Start Security Scan" button.
async function runFullScan(req, res) {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "A valid 'url' is required." });
  }

  try {
    // Basic probe request to power HTTPS / header / auth-indicator checks.
    let baseStatus = null;
    let baseHeaders = {};
    try {
      const baseResponse = await axios.get(url, {
        validateStatus: () => true,
        timeout: 5000,
      });
      baseStatus = baseResponse.status;
      baseHeaders = baseResponse.headers || {};
    } catch (err) {
      // If the base probe fails we still continue with the other tests,
      // each of which handles its own connection errors gracefully.
    }

    const results = [];
    results.push(checkHttps(url));
    results.push(checkHeaders(baseHeaders));
    results.push(checkAuthentication(baseStatus, baseHeaders));
    results.push(await checkBola(url));
    results.push(await checkPropertyAuthorization(url));
    results.push(await checkSensitiveData(url));
    results.push(await checkRateLimit(url));

    const score = calculateScore(results);
    const riskLevel = getRiskLevel(score);

    return res.status(200).json({
      target: url,
      timestamp: new Date().toISOString(),
      score,
      riskLevel,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      error: "The scan could not be completed.",
      details: err.message,
    });
  }
}

// Individual test endpoints, used by the dedicated test pages.

async function runBolaTest(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "A valid 'url' is required." });
  const result = await checkBola(url);
  return res.status(200).json(result);
}

async function runPropertyTest(req, res) {
  const { url, property, value } = req.body;
  if (!url) return res.status(400).json({ error: "A valid 'url' is required." });
  const result = await checkPropertyAuthorization(
    url,
    property || "role",
    value || "admin"
  );
  return res.status(200).json(result);
}

async function runSensitiveDataTest(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "A valid 'url' is required." });
  const result = await checkSensitiveData(url);
  return res.status(200).json(result);
}

async function runRateLimitTest(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "A valid 'url' is required." });
  const result = await checkRateLimit(url);
  return res.status(200).json(result);
}

module.exports = {
  runFullScan,
  runBolaTest,
  runPropertyTest,
  runSensitiveDataTest,
  runRateLimitTest,
};
