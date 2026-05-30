const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scans");
const chatRoutes = require("./routes/chats");

const app = express();

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/chats", chatRoutes);

// ─── Health check ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Planty API" });
});

// ─── Connect to MongoDB & start server ──────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("---------------Connected to MongoDB----------------");
    app.listen(PORT, () => {
      console.log(` Ayurvision running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });
