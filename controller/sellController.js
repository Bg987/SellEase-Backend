const Sell = require("../models/sell");
const { generateId } = require("../utils/IdGenerator");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const sharp = require("sharp");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sellItem = async (req, res) => {
    try {
        const { itemName, category, sellPrice, description, city } = req.body;
        const userId = req.userId;
        const images = req.files; // Multer stores images in `req.files`

        if (!images || images.length !== 3) {
            return res.status(400).json({ error: "Exactly 3 images must be uploaded" });
        }
        // Generate unique itemId
        const itemId = generateId();

        // Process and upload each image
        const uploadedImages = await Promise.all(images.map(async (image, index) => {
            const compressedImageBuffer = await sharp(image.buffer)
                .resize(800)
                .webp({ quality: 50 }) // Convert & compress
                .toBuffer();

            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "sellease",
                        public_id: `${itemId}_${index}`, // Unique name per image
                        resource_type: "image"
                    },
                    (error, result) => (error ? reject(error) : resolve(result.secure_url))
                ).end(compressedImageBuffer);
            });
        }));

        // Save to MongoDB
        const newSellItem = new Sell({
            sellId: itemId,
            userId,
            itemName,
            category,
            sellPrice,
            description,
            city,
            images: uploadedImages, // Store array of 3 image URLs
        });

        await newSellItem.save();
        return res.status(201).json({ message: "Item listed successfully" });

    } catch (error) {
        console.error("Error saving item:", error);
        return res.status(500).json({ error: "Database save failed", details: error.message });
    }
};

module.exports = { sellItem };
