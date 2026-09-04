/**
 * rateLimitCheck.js
 * ------------------
 * A CONTROLLED rate-limiting test. This sends only a small, fixed
 * number of requests (max 5) to the target URL and checks whether any
 * of them receive an HTTP 429 (Too Many Requests) response.
 *
 * This is intentionally NOT a stress test or flooding tool. It must
 * never be modified to send large volumes of requests.
 */

const axios = require("axios");

const MAX_REQUESTS = 5;

async function checkRateLimit(targetUrl) {
  const requestLog = [];
  let rateLimitDetected = false;

  for (let i = 1; i <= MAX_REQUESTS; i++) {
    const start = Date.now();
    try {
      const response = await axios.get(targetUrl, {
        validateStatus: () => true,
        timeout: 5000,
      });
      const responseTime = Date.now() - start;
      requestLog.push({
        requestNumber: i,
        status: response.status,
        responseTimeMs: responseTime,
      });
      if (response.status === 429) {
        rateLimitDetected = true;
      }
    } catch (err) {
      requestLog.push({
        requestNumber: i,
        status: "ERROR",
        responseTimeMs: Date.now() - start,
        error: err.message,
      });
    }
  }

  if (rateLimitDetected) {
    return {
      name: "Rate Limiting",
      status: "PASS",
      severity: "INFO",
      owasp: "API4 - Unrestricted Resource Consumption",
      evidence: "429 Too Many Requests detected during this controlled test.",
      recommendation: "No action needed. Continue monitoring rate limits under real load.",
      explanation:
        "The API returned a 429 response after a small number of repeated " +
        "requests, indicating that some form of rate limiting is in place.",
      requestLog,
    };
  }

  return {
    name: "Rate Limiting",
    status: "WARNING",
    severity: "MEDIUM",
    owasp: "API4 - Unrestricted Resource Consumption",
    evidence:
      "No rate-limiting response was observed during this controlled test " +
      `(${MAX_REQUESTS} requests sent).`,
    recommendation:
      "Add rate limiting (e.g. per-IP or per-user request throttling) and " +
      "return HTTP 429 once a reasonable threshold is exceeded.",
    explanation:
      "None of the small number of controlled requests triggered a 429 " +
      "response. This does not prove the API has no rate limiting at all — " +
      "only that it was not observed within this limited, controlled test.",
    requestLog,
  };
}

module.exports = { checkRateLimit, MAX_REQUESTS };
