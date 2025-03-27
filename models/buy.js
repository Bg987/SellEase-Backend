const mongoose = require("mongoose");

const buySchema = new mongoose.Schema({
    buyId: { type: String, required: true, unique: true }, // Auto-generate in Node.js
    sellId: { type: String, required: true, ref: "Sell" }, // Reference to Sell
    userId: { type: String, required: true, ref: "User" }, // Reference to User
    purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Buy", buySchema);
