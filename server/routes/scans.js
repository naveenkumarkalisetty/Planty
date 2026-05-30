const express = require("express");
const ScanHistory = require("../models/ScanHistory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All scan routes require authentication
router.use(authMiddleware);

/**
 * POST /api/scans
 * Body: { plantName, confidence, topPredictions }
 */
router.post("/", async (req, res) => {
  try {
    const { plantName, confidence, topPredictions } = req.body;

    if (!plantName || confidence === undefined) {
      return res
        .status(400)
        .json({ error: "plantName and confidence are required" });
    }

    const scan = new ScanHistory({
      userId: req.userId,
      plantName,
      confidence,
      topPredictions: topPredictions || [],
    });

    await scan.save();
    res.status(201).json({ scan });
  } catch (err) {
    console.error("[Scans] Save error:", err);
    res.status(500).json({ error: "Failed to save scan" });
  }
});

/**
 * GET /api/scans
 * Query: ?limit=20&skip=0
 * Returns user's scan history sorted by most recent
 */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const scans = await ScanHistory.find({ userId: req.userId })
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ScanHistory.countDocuments({ userId: req.userId });

    res.json({ scans, total });
  } catch (err) {
    console.error("[Scans] Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

/**
 * DELETE /api/scans/:id
 * Delete a specific scan
 */
router.delete("/:id", async (req, res) => {
  try {
    const scan = await ScanHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    res.json({ message: "Scan deleted" });
  } catch (err) {
    console.error("[Scans] Delete error:", err);
    res.status(500).json({ error: "Failed to delete scan" });
  }
});

module.exports = router;
