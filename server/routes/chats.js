const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Chat = require("../models/Chat");

// Get all chat threads for user
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .select("-messages"); // exclude messages for the list view to save bandwidth
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get a specific chat thread with messages
router.get("/:id", auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Create a new chat thread
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const newChat = new Chat({
      user: req.userId,
      title: title || "New Chat",
      messages: [],
    });
    const chat = await newChat.save();
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Add a message to a thread
router.post("/:id/messages", auth, async (req, res) => {
  try {
    const { role, content } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.messages.push({ role, content });
    
    // Auto-generate title if this is the first user message
    if (chat.messages.length === 1 && role === "user") {
      chat.title = content.substring(0, 30) + (content.length > 30 ? "..." : "");
    }

    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Delete a chat thread
router.delete("/:id", auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json({ msg: "Chat deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
