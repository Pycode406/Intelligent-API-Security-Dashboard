import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BOLATest from "./pages/BOLATest.jsx";
import PropertyAuthorizationTest from "./pages/PropertyAuthorizationTest.jsx";
import SensitiveDataTest from "./pages/SensitiveDataTest.jsx";
import RateLimitTest from "./pages/RateLimitTest.jsx";
import Report from "./pages/Report.jsx";

/**
 * App.jsx
 * --------
 * Top-level component. Holds the "latest scan" state in memory so
 * the Report page can show the most recent Dashboard scan result.
 * Kept intentionally simple (no Redux) per project requirements.
 */
export default function App() {
  const [latestScan, setLatestScan] = useState(null);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={<Dashboard onScanComplete={setLatestScan} />}
          />
          <Route path="/bola" element={<BOLATest />} />
          <Route
            path="/property-authorization"
            element={<PropertyAuthorizationTest />}
          />
          <Route path="/sensitive-data" element={<SensitiveDataTest />} />
          <Route path="/rate-limit" element={<RateLimitTest />} />
          <Route path="/report" element={<Report latestScan={latestScan} />} />
        </Routes>
      </div>
    </>
  );
}
