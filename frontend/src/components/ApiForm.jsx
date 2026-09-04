import React, { useState } from "react";

/**
 * ApiForm.jsx
 * Reusable form for entering an API endpoint URL and starting a test.
 */
export default function ApiForm({ onSubmit, loading, buttonLabel, defaultUrl }) {
  const [url, setUrl] = useState(defaultUrl || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim());
  }

  return (
    <form className="card-white" onSubmit={handleSubmit}>
      <label htmlFor="api-url">REST API Endpoint URL</label>
      <input
        id="api-url"
        type="text"
        placeholder="http://localhost:5000/api/secure/users/101"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="notice">
        Only scan APIs that you own or are explicitly authorized to test.
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Scanning..." : buttonLabel || "Start Security Scan"}
      </button>
    </form>
  );
}
