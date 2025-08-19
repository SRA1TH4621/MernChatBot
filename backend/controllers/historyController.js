const Message = require("../models/Message");

// 📜 Get conversation history
exports.getHistory = async (req, res) => {
  try {
    const { userId, conversationId } = req.params;

    const messages = await Message.find({ userId, conversationId }).sort({
      timestamp: 1,
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Error fetching history", error });
  }
};

// 🗑 Clear all messages in a specific conversation
exports.clearConversation = async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    await Message.deleteMany({ userId, conversationId });
    res.json({ message: "Conversation cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing conversation", error });
  }
};

// 🗑 Clear ALL history for a specific user
exports.clearAllHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.deleteMany({ userId });

    res.json({ message: `All history cleared for user ${userId}` });
  } catch (error) {
    console.error("Error clearing all history:", error);
    res.status(500).json({ message: "Error clearing all history", error });
  }
};
