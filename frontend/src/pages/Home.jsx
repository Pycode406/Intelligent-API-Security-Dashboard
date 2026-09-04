import React from "react";
import { Link } from "react-router-dom";

/**
 * Home.jsx
 * Explains the project, how it works, and the four security concepts.
 */
export default function Home() {
  return (
    <div>
      <h1>Intelligent API Security Testing Dashboard</h1>
      <p>
        This system demonstrates how REST APIs can
        be checked for a focused set of common API security weaknesses in a
        safe, controlled, and educational way.
      </p>

      <div className="card">
        <h3>What is this application?</h3>
        <p>
          An <strong>API (Application Programming Interface)</strong> is how
          different software systems talk to each other — for example, a
          mobile app asking a server for a user's profile. Because APIs
          often handle sensitive data and important actions, they need to be
          secure.
        </p>
        <p>
          <strong>API security matters</strong> because a weakness in an API
          can let an attacker view or modify data that isn't theirs, steal
          sensitive information, or overload a server with requests.
        </p>
        <p>
          This application lets a developer enter a REST API URL and runs a
          small set of <strong>controlled, non-destructive</strong> checks
          against it. Instead of just saying "vulnerable" or "safe", it
          walks through <strong>Detection → Evidence → Explanation → OWASP
          Mapping → Recommendation</strong> for every result.
        </p>
        <p>
          A built-in <strong>local Demo API</strong> (see below) provides
          safe, predictable secure and vulnerable endpoints so the tool can
          be demonstrated without touching any real, external API.
        </p>
        <p>
          Each result also has an <strong>"Explain Why"</strong> button,
          which asks the Gemini AI to explain the finding in simple,
          beginner-friendly language — with a rule-based fallback
          explanation if Gemini is ever unavailable.
        </p>
      </div>

      <h2 className="section-title">How It Works</h2>
      <div className="card-white">
        {[
          "Enter REST API URL",
          "Backend sends controlled requests",
          "Security tests are performed",
          "Responses are analyzed",
          "Security score is calculated",
          "Recommendations are generated",
          "Gemini explains findings",
          "PDF report",
        ].map((step, idx, arr) => (
          <React.Fragment key={step}>
            <div className="flow-box">{step}</div>
            {idx < arr.length - 1 && <div className="flow-arrow">↓</div>}
          </React.Fragment>
        ))}
      </div>

      <h2 className="section-title">Security Concepts Covered</h2>

      <div className="card">
        <h3>1. Broken Object Level Authorization (BOLA)</h3>
        <p><strong>OWASP API1 — Broken Object Level Authorization</strong></p>
        <p>
          An API may allow a user to access another user's object simply by
          changing an object ID in the request, for example:
        </p>
        <div className="evidence-box">{"GET /users/101\nGET /users/102"}</div>
        <p>
          If both objects can be accessed without a proper authorization
          check, this may indicate BOLA. It's dangerous because it lets one
          user view or modify another user's private data just by guessing
          or incrementing an ID.
        </p>
        <p>
          <strong>How our scanner tests it:</strong> it requests the object
          ID you provide, then tries one neighboring ID on the same
          endpoint, and checks whether the second object is also returned.
        </p>
        <p>
          <strong>How to fix it:</strong> always verify server-side that the
          logged-in user is authorized to access the specific object being
          requested — never rely on the ID being "hard to guess".
        </p>
        <Link to="/bola" className="btn">Try the BOLA Test</Link>
      </div>

      <div className="card">
        <h3>2. Broken Object Property Level Authorization</h3>
        <p><strong>OWASP API3 — Broken Object Property Level Authorization</strong></p>
        <p>
          An API may correctly identify the right object, but still allow a
          user to read or modify properties they shouldn't control. For
          example, a normal user might be allowed to change their{" "}
          <code>name</code>, but should never be able to set:
        </p>
        <div className="evidence-box">{'{ "name": "Alice", "role": "admin" }'}</div>
        <p>
          This is risky because it can let a regular user silently promote
          themselves to admin, or change other protected fields.
        </p>
        <p>
          <strong>How our scanner tests it:</strong> it sends a single,
          controlled update request that attempts to set a restricted
          property (like <code>role</code>) and checks whether the API
          accepts or rejects it.
        </p>
        <p>
          <strong>How to fix it:</strong> explicitly allow-list which fields
          a user may change, and reject any attempt to modify protected
          fields on the server side.
        </p>
        <Link to="/property-authorization" className="btn">Try the Property Test</Link>
      </div>

      <div className="card">
        <h3>3. Sensitive Data Exposure</h3>
        <p>
          APIs can accidentally return sensitive information such as
          passwords, password hashes, tokens, API keys, secrets, or credit
          card details, for example:
        </p>
        <div className="evidence-box">
          {'{ "id": 101, "name": "Alice", "password": "..." }'}
        </div>
        <p>
          Our scanner checks response field <em>names</em> (never the
          values) against a list of commonly sensitive terms. Note:{" "}
          <strong>
            Sensitive Data Exposure is not a standalone OWASP API Security
            Top 10 2023 category on its own
          </strong>
          . It's an important problem that overlaps with categories such as
          Broken Object/Property Level Authorization and generally unsafe
          API response design.
        </p>
        <Link to="/sensitive-data" className="btn">Try the Sensitive Data Test</Link>
      </div>

      <div className="card">
        <h3>4. Rate Limiting / Unrestricted Resource Consumption</h3>
        <p><strong>OWASP API4 — Unrestricted Resource Consumption</strong></p>
        <p>
          Rate limiting controls how many requests a client can make in a
          given time window. Without it, an API can be overwhelmed with
          traffic, leading to slowdowns or outages.
        </p>
        <p>
          <strong>HTTP 429 (Too Many Requests)</strong> is the standard
          response an API should return once a client exceeds its allowed
          request rate.
        </p>
        <p>
          <strong>Our controlled test</strong> sends only a small, fixed
          number of requests (3–5) and checks whether a 429 response
          appears. This is never a stress test or flooding tool.
        </p>
        <p>
          <strong>Recommended fixes:</strong> add per-IP or per-user request
          throttling, and return 429 once a reasonable threshold is
          exceeded.
        </p>
        <Link to="/rate-limit" className="btn">Try the Rate Limit Test</Link>
      </div>

      <div className="notice">
        Only scan APIs that you own or are explicitly authorized to test.
        This tool is a controlled, beginner-level educational scanner — not
        a replacement for professional penetration-testing tools.
      </div>

      <Link to="/dashboard" className="btn">Go to Dashboard →</Link>
    </div>
  );
}
