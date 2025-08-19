const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true, // ✅ Faster lookups
  },
  userId: {
    type: String,
    required: true,
    default: "guest", // ✅ Default until auth system added
    index: true, // ✅ Query optimization
  },
  sender: {
    type: String,
    enum: ["user", "bot"], // Only allow user or bot
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String, // ✅ URL or base64 string if bot generates/uploads an image
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Compound index for quick retrieval of conversations per user
module.exports = mongoose.model("Message", messageSchema);
