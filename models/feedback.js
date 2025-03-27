const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    feedbackId: { type: String, required: true, unique: true }, // Auto-generate in Node.js
    userId: { type: String, required: true, ref: "User" }, // Reference to User
    review: { type: String, required: true, maxlength: 500 },
    rating: { type: Number, min: 1, max: 5, required: false }, // Optional rating
    timeAndDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
