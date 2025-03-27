const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFolder = async (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath); // Read all files in the folder
        for (const file of files) {
            const filePath = path.join(folderPath, file);

            // Upload each file to Cloudinary
            const response = await cloudinary.uploader.upload(filePath, {
                folder: "sellease", // Folder in Cloudinary
                public_id: path.parse(file).name, // Keep original file name
                overwrite: true
            });

            console.log(`Uploaded: ${response.secure_url}`);
        }
        console.log("All images uploaded successfully!");
    } catch (error) {
        console.error("Error uploading images:", error);
    }
};

// Call function with folder path
uploadFolder(path.join(__dirname, "data/uploads"));
