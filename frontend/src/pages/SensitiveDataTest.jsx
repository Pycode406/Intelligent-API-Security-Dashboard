import React, { useState } from "react";
import ApiForm from "../components/ApiForm.jsx";
import ExplainWhy from "../components/ExplainWhy.jsx";
import { runSensitiveDataTest } from "../services/api.js";

/**
 * SensitiveDataTest.jsx
 * Dedicated page for the Sensitive Data Exposure check.
 * Actual sensitive values are NEVER shown — only masked field names.
 */
export default function SensitiveDataTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleTest(url) {
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await runSensitiveDataTest(url);
    setLoading(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response.data);
  }

  return (
    <div>
      <h1>Sensitive Data Test</h1>
      <p>
        This test inspects the JSON response body for field <em>names</em>{" "}
        that commonly indicate sensitive data (password, token, apiKey,
        secret, etc). Actual values are always masked as{" "}
        <code>[HIDDEN]</code> and never shown in this UI.
      </p>

      <div className="card">
        <p><strong>Try it with the local Demo API:</strong></p>
        <p>Secure: <code>http://localhost:5000/api/secure/profile</code></p>
        <p>Vulnerable: <code>http://localhost:5000/api/vulnerable/profile</code></p>
      </div>

      <ApiForm
        onSubmit={handleTest}
        loading={loading}
        buttonLabel="Run Sensitive Data Test"
        defaultUrl="http://localhost:5000/api/vulnerable/profile"
      />

      {error && <div className="notice">Error: {error}</div>}

      {result && (
        <div className="card">
          <h3>{result.name} — <span>{result.status}</span></h3>
          <p><strong>Severity:</strong> {result.severity}</p>
          <p><strong>OWASP Mapping:</strong> {result.owasp}</p>
          <p><strong>Evidence (values masked):</strong></p>
          <div className="evidence-box">{result.evidence}</div>
          <p style={{ marginTop: 10 }}>
            <strong>Recommendation:</strong> {result.recommendation}
          </p>
          <ExplainWhy finding={result} />
        </div>
      )}
    </div>
  );
}
