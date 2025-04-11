const Sell = require("../models/sell"); // Import the Sell model

const buy = async (req, res) => {
    const userId = req.userId;
    try {
        items = await Sell.find({ userId: { $ne: userId } }); // Exclude user's items
        if (items.length > 0) {
            return res.json({ success: true, items: items });
        } else {
            return res.json({ success: false, message: "No items found for this user." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
};

module.exports = { buy };
