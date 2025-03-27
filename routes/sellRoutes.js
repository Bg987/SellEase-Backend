const express = require("express");
const { sellItem } = require("../controller/sellController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to handle file upload
router.post("/", authMiddleware, sellItem);

module.exports = router;
