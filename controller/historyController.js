const Sell = require("../models/sell"); // Import the Sell model

const history = async (req, res) => {
    const userId = req.userId;
    
    try {
        const items = await Sell.find({ userId });
        if (items.length > 0) {
            // Map through items and generate full URLs for all images

            res.json({ success: true, items: items });
        } else {
            res.json({ success: false, message: "No items found for this user." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
    return
};

module.exports = { history };
