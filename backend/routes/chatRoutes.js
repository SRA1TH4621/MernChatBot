const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { sendMessage } = require("../controllers/chatController");
// 📜 Get all messages for a conversation
router.get("/:userId/:conversationId", historyController.getHistory);

// 💾 Save a new message
router.post("/", historyController.addMessage);

// 🗑 Clear a specific conversation
router.delete("/:userId/:conversationId", historyController.clearConversation);

// 🗑 Clear ALL history for a user
router.delete("/:userId", historyController.clearAllHistory);

router.post("/", sendMessage);


module.exports = router;
