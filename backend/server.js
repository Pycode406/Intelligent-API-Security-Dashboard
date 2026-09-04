/**
 * server.js
 * ----------
 * Entry point for the Security Scanner Backend.
 * Runs on http://localhost:5001 by default.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const scanRoutes = require("./routes/scanRoutes");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use("/api", scanRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Intelligent API Security Testing Dashboard — Backend",
    status: "running",
  });
});

// Basic error handler so unexpected errors don't crash the process.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Security Scanner Backend running at http://localhost:${PORT}`);
});
