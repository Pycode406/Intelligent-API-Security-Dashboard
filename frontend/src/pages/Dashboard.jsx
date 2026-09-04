import React, { useState } from "react";
import ApiForm from "../components/ApiForm.jsx";
import SecurityScore from "../components/SecurityScore.jsx";
import SecurityChecks from "../components/SecurityChecks.jsx";
import VulnerabilityList from "../components/VulnerabilityList.jsx";
import Recommendations from "../components/Recommendations.jsx";
import { runFullScan } from "../services/api.js";

/**
 * Dashboard.jsx
 * Main scan page: enter a URL, run all checks, view score + results.
 */
export default function Dashboard({ onScanComplete }) {
  const [loading, setLoading] = useState(false);
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);

  async function handleScan(url) {
    setLoading(true);
    setError(null);
    setScan(null);

    const response = await runFullScan(url);
    setLoading(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    setScan(response.data);
    if (onScanComplete) onScanComplete(response.data);
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Enter a REST API endpoint and run the full controlled security scan.</p>

      <ApiForm
        onSubmit={handleScan}
        loading={loading}
        buttonLabel="Start Security Scan"
        defaultUrl="http://localhost:5000/api/secure/users/101"
      />

      {error && <div className="notice">Error: {error}</div>}

      {scan && (
        <>
          <div className="grid-2">
            <SecurityScore score={scan.score} riskLevel={scan.riskLevel} />
            <SecurityChecks results={scan.results} />
          </div>

          <h2 className="section-title">Detailed Results</h2>
          <VulnerabilityList results={scan.results} />

          <Recommendations results={scan.results} />
        </>
      )}
    </div>
  );
}
