const mongoose = require("mongoose");

const saveNameSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    friendId: { type: String, required: true },
    friendName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Ensure (userId, friendId) combination is unique
saveNameSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports = mongoose.model("FriendName", saveNameSchema);
