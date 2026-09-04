/**
 * calculateScore.js
 * -----------------
 * Simple, beginner-friendly security scoring logic.
 *
 * The score starts at 100. Each finding deducts points based on its
 * severity. The final score is clamped between 0 and 100.
 */

const SEVERITY_DEDUCTIONS = {
  CRITICAL: 25,
  HIGH: 20,
  MEDIUM: 10,
  LOW: 5,
  INFO: 0,
};

/**
 * results: an array of standard result objects, each with a
 * `status` ("PASS" | "WARNING" | "POTENTIAL VULNERABILITY") and a
 * `severity` ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO").
 */
function calculateScore(results) {
  let score = 100;

  results.forEach((result) => {
    // Only deduct points for findings that are not a clean PASS.
    if (result.status !== "PASS") {
      const deduction = SEVERITY_DEDUCTIONS[result.severity] || 0;
      score -= deduction;
    }
  });

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
}

function getRiskLevel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Medium";
  return "Poor";
}

module.exports = { calculateScore, getRiskLevel };
