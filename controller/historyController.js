const Sell = require("../models/sell"); // Import the Sell model

const history = async (req, res) => {
    const userId = req.userId;
    
    try {
        const items = await Sell.find({ userId });
        if (items.length > 0) {
            // Map through items and generate full URLs for all images
            const updatedItems = items.map(item => ({
                ...item._doc,
                imageUrls: item.images.map(img => `http://192.168.254.47:5000/uploads/${img}`), // Adjust path
                bOrS : userId===item.userId,
            }));

            res.json({ success: true, items: updatedItems });
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
