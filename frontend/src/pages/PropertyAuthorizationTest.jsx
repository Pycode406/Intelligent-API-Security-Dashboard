import React, { useState } from "react";
import ExplainWhy from "../components/ExplainWhy.jsx";
import { runPropertyTest } from "../services/api.js";

/**
 * PropertyAuthorizationTest.jsx
 * Dedicated page for the Broken Object Property Level Authorization test.
 * Lets the user specify the endpoint, the property, and the test value.
 */
export default function PropertyAuthorizationTest() {
  const [url, setUrl] = useState("http://localhost:5000/api/vulnerable/users/101");
  const [property, setProperty] = useState("role");
  const [value, setValue] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await runPropertyTest(url, property, value);
    setLoading(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response.data);
  }

  return (
    <div>
      <h1>Property Authorization Test</h1>
      <p>
        This test checks for <strong>Broken Object Property Level
        Authorization</strong> (OWASP API3) by attempting to update a
        restricted property on the object and observing whether the API
        accepts or rejects the change.
      </p>

      <div className="card">
        <p><strong>Try it with the local Demo API:</strong></p>
        <p>Secure: <code>PUT http://localhost:5000/api/secure/users/101</code></p>
        <p>Vulnerable: <code>PUT http://localhost:5000/api/vulnerable/users/101</code></p>
      </div>

      <form className="card-white" onSubmit={handleSubmit}>
        <label>API Endpoint</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />

        <label>Property to Test</label>
        <input type="text" value={property} onChange={(e) => setProperty(e.target.value)} />

        <label>Test Value</label>
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />

        <div className="notice">
          Only scan APIs that you own or are explicitly authorized to test.
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Testing..." : "Run Property Test"}
        </button>
      </form>

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
