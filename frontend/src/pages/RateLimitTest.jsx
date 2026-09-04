import React, { useState } from "react";
import ApiForm from "../components/ApiForm.jsx";
import ExplainWhy from "../components/ExplainWhy.jsx";
import { runRateLimitTest } from "../services/api.js";

/**
 * RateLimitTest.jsx
 * Dedicated page for the Rate Limiting / Unrestricted Resource
 * Consumption test. Sends only a small, fixed number of requests
 * (maximum 5) — never a stress test.
 */
export default function RateLimitTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleTest(url) {
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await runRateLimitTest(url);
    setLoading(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response.data);
  }

  return (
    <div>
      <h1>Rate Limit Test</h1>
      <p>
        This test sends a small, controlled number of requests (maximum 5)
        to the target endpoint and checks whether an HTTP{" "}
        <strong>429 Too Many Requests</strong> response appears.
      </p>

      <div className="card">
        <p><strong>Try it with the local Demo API:</strong></p>
        <p>Secure: <code>http://localhost:5000/api/secure/products</code></p>
        <p>Vulnerable: <code>http://localhost:5000/api/vulnerable/products</code></p>
      </div>

      <ApiForm
        onSubmit={handleTest}
        loading={loading}
        buttonLabel="Run Rate Limit Test"
        defaultUrl="http://localhost:5000/api/vulnerable/products"
      />

      {error && <div className="notice">Error: {error}</div>}

      {result && (
        <div className="card">
          <h3>{result.name} — <span>{result.status}</span></h3>
          <p><strong>Severity:</strong> {result.severity}</p>
          <p><strong>OWASP Mapping:</strong> {result.owasp}</p>
          <p><strong>Evidence:</strong></p>
          <div className="evidence-box">{result.evidence}</div>

          {result.requestLog && (
            <table>
              <thead>
                <tr><th>Request #</th><th>Status</th><th>Response Time (ms)</th></tr>
              </thead>
              <tbody>
                {result.requestLog.map((r) => (
                  <tr key={r.requestNumber}>
                    <td>{r.requestNumber}</td>
                    <td>{r.status}</td>
                    <td>{r.responseTimeMs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p style={{ marginTop: 10 }}>
            <strong>Recommendation:</strong> {result.recommendation}
          </p>
          <ExplainWhy finding={result} />
        </div>
      )}
    </div>
  );
}
