const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/history",authMiddleware, chatController.getChatHistory);
router.get("/unread",authMiddleware ,chatController.getUnreadMessages);
router.put("/markAsRead", authMiddleware ,chatController.markMessagesAsRead);
router.get("/chatUser", authMiddleware ,chatController.getChatUsers);
module.exports = router;
