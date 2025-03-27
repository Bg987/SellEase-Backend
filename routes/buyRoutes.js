const express = require("express");
const { buy } = require("../controller/buyController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to handle file upload
router.get("/", authMiddleware, buy);

module.exports = router;
