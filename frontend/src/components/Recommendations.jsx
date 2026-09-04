import React from "react";

/**
 * Recommendations.jsx
 * Displays a simple list of recommendations extracted from results
 * that are not a clean PASS.
 */
export default function Recommendations({ results }) {
  const actionable = (results || []).filter((r) => r.status !== "PASS");

  if (actionable.length === 0) {
    return (
      <div className="card">
        <h3>Recommendations</h3>
        <p>No major issues found. Keep monitoring your API regularly.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Recommendations</h3>
      <ul>
        {actionable.map((r, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <strong>{r.name}:</strong> {r.recommendation}
          </li>
        ))}
      </ul>
    </div>
  );
}
