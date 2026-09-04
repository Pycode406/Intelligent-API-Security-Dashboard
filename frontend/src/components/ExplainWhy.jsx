import React, { useState } from "react";
import { explainFinding } from "../services/api.js";

/**
 * ExplainWhy.jsx
 * The "Explain Why" button shown on each finding. Calls the backend,
 * which calls Gemini. Falls back gracefully if AI is unavailable.
 */
export default function ExplainWhy({ finding }) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const response = await explainFinding(finding);
    setLoading(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    const data = response.data;
    if (data.available) {
      setExplanation(data.explanation);
      setUnavailable(false);
    } else {
      setExplanation(data.fallbackExplanation);
      setUnavailable(true);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button className="btn btn-secondary" onClick={handleClick} disabled={loading}>
        {loading ? "Thinking..." : "Explain Why"}
      </button>

      {error && (
        <div className="notice" style={{ marginTop: 10 }}>
          Could not reach the backend: {error}
        </div>
      )}

      {explanation && (
        <div className="card-white" style={{ marginTop: 10 }}>
          {unavailable && (
            <p style={{ color: "#ef6c00", fontWeight: 600 }}>
              AI explanation is currently unavailable. The rule-based
              explanation and recommendation are still available.
            </p>
          )}
          <h4>Why was this flagged?</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{explanation}</p>
          <h4>Recommended Fix</h4>
          <p>{finding.recommendation}</p>
        </div>
      )}
    </div>
  );
}
