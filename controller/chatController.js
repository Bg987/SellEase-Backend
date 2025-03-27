const mongoose = require('mongoose');
const Chat = require("../models/chat");
const User = require("../models/user");
// Get chat history between two users
exports.getChatHistory = async (req, res) => {
    try {
        const senderId = req.userId;
        const receiverId = req.fields.sellerId;
        const chats = await Chat.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ timestamp: 1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Get unread message count for a user
exports.getUnreadMessages = async (req, res) => {
    try {
        const  userId  = req.userId;
         const unreadCount = await Chat.countDocuments({
            receiverId: userId,
            read: false
        });
        res.status(200).json({unreadCount });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
       const receiverId = req.userId;
        const senderId = req.fields.sellerId;
        await Chat.updateMany(
            { senderId, receiverId, read: false },
            { $set: { read: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getChatUsers = async (req, res) => {
    try {
        const userId = req.userId; // Extract userId from the request

        // Fetch unique user IDs where the user is involved (both sender and receiver)
        const uniqueUserIds = await Chat.distinct('senderId', { $or: [{ senderId: userId }, { receiverId: userId }] })
            .then(senderUserIds => 
                Chat.distinct('receiverId', { $or: [{ senderId: userId }, { receiverId: userId }] })
                    .then(receiverUserIds => [...new Set([...senderUserIds, ...receiverUserIds])])
            );

        // Fetch user IDs where there are unseen messages
        const unseenUserIds = await Chat.distinct('senderId', {
            receiverId: userId,
            read: false
        });

        // Modify response to include unread status for each user
        const usersWithUnreadStatus = uniqueUserIds.map(id => ({
            userId: id,
            hasUnreadMessages: unseenUserIds.includes(id)
        }));

        res.json({
            success: true,
            users: usersWithUnreadStatus
        });
    } catch (err) {
        console.error("Error fetching chat users:", err);
        res.status(500).json({ error: "Server error" });
    }
};

