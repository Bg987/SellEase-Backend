const express = require("express");
const { sellItem } = require("../controller/sellController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const router = express.Router();

// Route to handle file upload
router.post("/",upload, sellItem);

module.exports = router;
