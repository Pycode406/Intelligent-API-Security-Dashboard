import React from "react";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";

/**
 * Report.jsx
 * Displays the most recent Dashboard scan and allows downloading a
 * simple PDF report using jsPDF.
 */
export default function Report({ latestScan }) {
  if (!latestScan) {
    return (
      <div>
        <h1>Report</h1>
        <p>No scan has been run yet.</p>
        <Link to="/dashboard" className="btn">Go to Dashboard</Link>
      </div>
    );
  }

  const { target, timestamp, score, riskLevel, results } = latestScan;

  function downloadPdf() {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("Intelligent API Security Testing Dashboard", 15, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Target API: ${target}`, 15, y); y += 7;
    doc.text(`Date/Time: ${new Date(timestamp).toLocaleString()}`, 15, y); y += 7;
    doc.text(`Security Score: ${score} / 100`, 15, y); y += 7;
    doc.text(`Risk Level: ${riskLevel}`, 15, y); y += 10;

    doc.setFontSize(13);
    doc.text("Findings:", 15, y); y += 8;
    doc.setFontSize(10);

    results.forEach((r) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setFont(undefined, "bold");
      doc.text(`${r.name} — ${r.status} (${r.severity})`, 15, y); y += 6;
      doc.setFont(undefined, "normal");

      const owaspLines = doc.splitTextToSize(`OWASP: ${r.owasp}`, 180);
      doc.text(owaspLines, 15, y); y += owaspLines.length * 5;

      const evidenceLines = doc.splitTextToSize(`Evidence: ${r.evidence}`, 180);
      doc.text(evidenceLines, 15, y); y += evidenceLines.length * 5;

      const recLines = doc.splitTextToSize(`Recommendation: ${r.recommendation}`, 180);
      doc.text(recLines, 15, y); y += recLines.length * 5 + 4;
    });

    doc.save("api-security-report.pdf");
  }

  return (
    <div>
      <h1>Security Report</h1>
      <div className="card-white">
        <p><strong>Application:</strong> Intelligent API Security Testing Dashboard</p>
        <p><strong>Target API:</strong> {target}</p>
        <p><strong>Date/Time:</strong> {new Date(timestamp).toLocaleString()}</p>
        <p><strong>Security Score:</strong> {score} / 100</p>
        <p><strong>Risk Level:</strong> {riskLevel}</p>
        <button className="btn" onClick={downloadPdf}>Download PDF Report</button>
      </div>

      <h2 className="section-title">Findings</h2>
      {results.map((r, idx) => (
        <div className="card" key={idx}>
          <h3>{r.name} — {r.status}</h3>
          <p><strong>Severity:</strong> {r.severity}</p>
          <p><strong>OWASP Mapping:</strong> {r.owasp}</p>
          <p><strong>Evidence:</strong></p>
          <div className="evidence-box">{r.evidence}</div>
          <p style={{ marginTop: 10 }}><strong>Recommendation:</strong> {r.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
