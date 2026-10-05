/**
 * aiController.js
 * -----------------
 * Handles the "Explain Why" feature. This is the ONLY place in the
 * backend that talks to the Gemini API. The frontend never sees the
 * Gemini API key.
 *
 * If the Gemini API key is missing, the request fails, or the network
 * is unavailable, this controller returns a friendly fallback message
 * instead of crashing the application. The rest of the scanner keeps
 * working without Gemini.
 */

const axios = require("axios");

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(finding) {
  return `You are helping a beginner engineering student understand an API
security scan result from a college project called "Intelligent API
Security Testing Dashboard".

Explain the following finding in simple, beginner-friendly language.
Answer these questions clearly, using short paragraphs or a short list:
1. What is this vulnerability?
2. Why was it flagged?
3. What evidence was observed?
4. Why is it dangerous?
5. How can a developer fix it?

Finding details:
- Name: ${finding.name}
- OWASP category: ${finding.owasp}
- Status: ${finding.status}
- Severity: ${finding.severity}
- Evidence: ${finding.evidence}
- Existing rule-based recommendation: ${finding.recommendation}

Keep the explanation concise, friendly, and easy for a student to
repeat during a viva (oral exam). Do not include any real personal
data — this is a demo/educational scan only.`;
}

async function explainFinding(req, res) {
  const finding = req.body;

  if (!finding || !finding.name) {
    return res.status(400).json({ error: "A valid finding object is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return res.status(200).json({
      available: false,
      message:
        "AI explanation is currently unavailable. The rule-based " +
        "explanation and recommendation are still available.",
      fallbackExplanation: finding.explanation,
      fallbackRecommendation: finding.recommendation,
    });
  }

  try {
    const prompt = buildPrompt(finding);

    const response = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      { timeout: 15000 }
    );

    const aiText =
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0] &&
      response.data.candidates[0].content.parts[0].text;

    if (!aiText) {
      throw new Error("Gemini returned an unexpected response format.");
    }

    return res.status(200).json({
      available: true,
      explanation: aiText,
    });
  } catch (err) {
    // Network error, quota exceeded, invalid key, etc. — never crash.
    return res.status(200).json({
      available: false,
      message:
        "AI explanation is currently unavailable. The rule-based " +
        "explanation and recommendation are still available.",
      fallbackExplanation: finding.explanation,
      fallbackRecommendation: finding.recommendation,
      debug: err.message,
    });
  }
}

module.exports = { explainFinding };
