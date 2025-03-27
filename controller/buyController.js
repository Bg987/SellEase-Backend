const Sell = require("../models/sell"); // Import the Sell model

const buy = async (req, res) => {
    const userId = req.userId;
    try {
        items = await Sell.find({ userId: { $ne: userId } }); // Exclude user's items
        if (items.length > 0) {
            // Map through items and generate full URLs for all images
            res.json({ success: true, items});
        } else {
            res.json({ success: false, message: "No items found for this user." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

module.exports = { buy };
