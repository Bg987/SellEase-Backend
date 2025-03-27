const Sell = require("../models/sell");
const { generateId } = require("../utils/IdGenerator");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sellItem = async (req, res) => {
    try {
        const { itemName, category, sellPrice, description, city } = req.fields; // Form data
        const userId = req.userId;
        const { images } = req.files; // File data

        if (!images) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // Generate unique itemId
        const itemId = generateId();

        // Upload image to Cloudinary with itemId as filename
        const cloudinaryResponse = await cloudinary.uploader.upload(images.path, {
            folder: "sellease", // Store images in 'sellease' folder in Cloudinary
            public_id: itemId,  // Set filename as itemId
            overwrite: true     // Overwrite if already exists
        });

        // Save form data in MongoDB
        const newSellItem = new Sell({
            sellId: itemId,
            userId,
            itemName,
            category,
            sellPrice,
            description,
            city,
            images: cloudinaryResponse.secure_url // Store Cloudinary image URL
        });

        await newSellItem.save();
        return res.status(201).json({ message: "Item listed successfully", data: newSellItem });

    } catch (error) {
        console.error("Error saving item:", error);
        return res.status(500).json({ error: "Database save failed", details: error.message });
    }
};

module.exports = { sellItem };
