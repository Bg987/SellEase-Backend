const multer = require("multer");

// Multer Storage Configuration (In-memory)
const storage = multer.memoryStorage();
try {
    const upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
    }).array("images", 3); // Accepts exactly 3 images
    module.exports = upload;

}
catch (err) {
    console.log("multer error ", err);
}

