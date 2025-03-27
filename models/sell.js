const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
    sellId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: "User" },
    itemName: { type: String, required: true },
    category: { 
        type: String, 
        enum: ["Automobiles", "Electronics", "Home Appliances"], 
        required: true 
    },
    sellPrice: { type: Number, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    images: [{ type: String,default : "abcd" }], // Store image file paths
    status: { type: String, enum: ["available", "sold"], default: "available" },
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Sell||mongoose.model("Sell", sellSchema);
