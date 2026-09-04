import React, { useState } from "react";
import ApiForm from "../components/ApiForm.jsx";
import ExplainWhy from "../components/ExplainWhy.jsx";
import { runBolaTest } from "../services/api.js";

/**
 * BOLATest.jsx
 * Dedicated page for the Broken Object Level Authorization test.
 */
export default function BOLATest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleTest(url) {
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await runBolaTest(url);
    setLoading(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response.data);
  }

  return (
    <div>
      <h1>BOLA Test</h1>
      <p>
        This test checks for <strong>Broken Object Level Authorization</strong>{" "}
        (OWASP API1) by requesting the object ID you provide, then trying a
        neighboring object ID on the same endpoint, to see whether both are
        accessible without a proper authorization check.
      </p>

      <div className="card">
        <p><strong>Try it with the local Demo API:</strong></p>
        <p>Secure: <code>http://localhost:5000/api/secure/users/101</code></p>
        <p>Vulnerable: <code>http://localhost:5000/api/vulnerable/users/101</code></p>
      </div>

      <ApiForm
        onSubmit={handleTest}
        loading={loading}
        buttonLabel="Run BOLA Test"
        defaultUrl="http://localhost:5000/api/vulnerable/users/101"
      />

      {error && <div className="notice">Error: {error}</div>}

      {result && (
        <div className="card">
          <h3>{result.name} — <span>{result.status}</span></h3>
          <p><strong>Severity:</strong> {result.severity}</p>
          <p><strong>OWASP Mapping:</strong> {result.owasp}</p>
          <p><strong>Evidence:</strong></p>
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
