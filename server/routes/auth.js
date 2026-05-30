const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "planty_super_secret_key_2024";

/**
 * POST /api/auth/register
 * Body: { fullName, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

/**
 * GET /api/auth/me
 * Returns current user profile (requires auth)
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: user.toJSON() });
  } catch (err) {
    console.error("[Auth] Profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/auth/me
 * Update user profile (name, password)
 */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { fullName, password } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (fullName) {
      user.fullName = fullName;
    }
    
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      user.password = password; // pre-save hook will hash it
    }

    await user.save();
    res.json({ user: user.toJSON(), msg: "Profile updated successfully" });
  } catch (err) {
    console.error("[Auth] Profile update error:", err);
    res.status(500).json({ error: "Server error during profile update" });
  }
});

module.exports = router;
