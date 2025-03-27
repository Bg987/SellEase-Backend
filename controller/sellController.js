const fs = require("fs");
const formidable = require("express-formidable");
const path = require("path");
const Sell = require("../models/sell");
const {generateId} = require("../utils/IdGenerator")

const sellItem = async (req, res) => {
    try {
        const { itemName, category, sellPrice, description, city } = req.fields; // Form data
        const userId = req.userId;
        const { images } = req.files; // File data
        //console.log(req);
        if (!images) {
            return res.status(400).json({ error: "No image uploaded" });
        }
        // Create upload directory if not exists
        const uploadDir = path.join(__dirname, "../data/uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        // Rename and move the uploaded file
        const fileName = `image_${Date.now()}${path.extname(images.name)}`;
        const filePath = path.join(uploadDir, fileName);
        fs.renameSync(images.path, filePath);

        // Save form data in MongoDB
        const newSellItem = new Sell({
            sellId : generateId(),
            userId,
            itemName,
            category,
            sellPrice,
            description,
            city,
            images: fileName, // Store only filename
        });
        await newSellItem.save();
        return res.status(201).json({ message: "Item listed successfully", data: newSellItem });

    } catch (error) {
        console.error("Error saving item:", error);
        return res.status(500).json({ error: "Database save failed", details: error.message });
    }
};

module.exports = { sellItem };
