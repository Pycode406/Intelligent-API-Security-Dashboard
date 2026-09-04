import React from "react";

/**
 * SecurityChecks.jsx
 * A compact summary row shown at the top of the Dashboard, listing
 * which checks were performed.
 */
export default function SecurityChecks({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="card-white">
      <h3>Tests Performed</h3>
      <ul>
        {results.map((r, idx) => (
          <li key={idx}>
            {r.name} — <strong>{r.status}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
