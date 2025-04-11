const Sell = require("../models/sell"); // Import the Sell model

const history = async (req, res) => {
    const userId = req.userId;

    try {
        const items = await Sell.find({ userId });
        if (items.length > 0) {

            return res.json({ success: true, items: items });
        } else {
            return res.json({ success: false, message: "No items found for this user." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error", error });
    }
    return
};

module.exports = { history };
