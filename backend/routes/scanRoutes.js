/**
 * scanRoutes.js
 * --------------
 * All API routes exposed by the Security Scanner Backend.
 */

const express = require("express");
const router = express.Router();

const {
  runFullScan,
  runBolaTest,
  runPropertyTest,
  runSensitiveDataTest,
  runRateLimitTest,
} = require("../controllers/scanController");

const { explainFinding } = require("../controllers/aiController");

// Full dashboard scan (runs all checks)
router.post("/scan", runFullScan);

// Individual test pages
router.post("/scan/bola", runBolaTest);
router.post("/scan/property-authorization", runPropertyTest);
router.post("/scan/sensitive-data", runSensitiveDataTest);
router.post("/scan/rate-limit", runRateLimitTest);

// Gemini "Explain Why" feature
router.post("/explain", explainFinding);

module.exports = router;
