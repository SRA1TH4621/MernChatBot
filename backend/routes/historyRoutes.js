const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");

// 📜 Get all messages for a conversation (by user + conversationId)
router.get("/:userId/:conversationId", historyController.getHistory);

// 🗑 Clear chat (delete all messages for a conversation)
router.delete("/:userId/:conversationId", historyController.clearConversation);

// 🗑 Clear ALL history for a user
router.delete("/:userId", historyController.clearAllHistory);

module.exports = router;
