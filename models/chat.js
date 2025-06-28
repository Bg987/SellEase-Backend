const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    suggestions: { type: [String], default: [] }  // ✅ You added this

});

module.exports = mongoose.model("Chat", chatSchema);