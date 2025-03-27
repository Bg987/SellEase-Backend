const express = require("express");
const { history } = require("../controller/historyController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to handle file upload
router.get("/", authMiddleware, history);

module.exports = router;
