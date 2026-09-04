import React from "react";

/**
 * SecurityScore.jsx
 * Displays the overall numeric score (out of 100) and risk level.
 */
export default function SecurityScore({ score, riskLevel }) {
  return (
    <div className="card-white" style={{ textAlign: "center" }}>
      <h3>Security Score</h3>
      <div className="score-circle">
        <div className="score-number">{score}</div>
        <div style={{ fontSize: 12 }}>/ 100</div>
      </div>
      <p style={{ marginTop: 16, fontWeight: 700, color: "#0b3d91" }}>
        Risk Level: {riskLevel}
      </p>
    </div>
  );
}
