const mongoose = require('mongoose');
const Chat = require("../models/chat");
const SetName = require("../models/saveName");
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
        return res.json(chats);
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
};

// Get unread message count for a user
exports.getUnreadMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const unreadCount = await Chat.countDocuments({
            receiverId: userId,
            read: false
        });
        return res.status(200).json({ unreadCount });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
};
exports.SetName = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendName, friendId } = req.fields;
        // // Check if a name already exists for this friend
        let existingEntry = await SetName.findOne({ userId, friendId });

        if (existingEntry) {
            // Update the existing friend's name
            existingEntry.friendName = friendName;
            await existingEntry.save();
            return res.status(200).json({ success: true, message: "Friend name updated successfully" });
        } else {
            // Create a new entry
            const newFriendName = new SetName({ userId, friendId, friendName });
            await newFriendName.save();
            return res.status(201).json({ success: true, message: "Friend name saved successfully" });
        }
    } catch (error) {
        console.error("Error saving friend name:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}
// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const receiverId = req.userId;
        const senderId = req.fields.sellerId;
        await Chat.updateMany(
            { senderId, receiverId, read: false },
            { $set: { read: true } }
        );
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
};

exports.getChatUsers = async (req, res) => {
    try {
        const userId1 = req.userId;

        // Fetch unique user IDs where the user is involved (both sender and receiver)
        const senderUserIds = await Chat.distinct("senderId", { $or: [{ senderId: userId1 }, { receiverId: userId1 }] });
        const receiverUserIds = await Chat.distinct("receiverId", { $or: [{ senderId: userId1 }, { receiverId: userId1 }] });

        const uniqueUserIds = [...new Set([...senderUserIds, ...receiverUserIds])];

        // Fetch user IDs where there are unseen messages
        const unseenUserIds = await Chat.distinct("senderId", {
            receiverId: userId1,
            read: false,
        });
        // Fetch all saved names where userId1 is the user
        const savedNames = await SetName.find({ userId: userId1 });
        // Convert to a lookup object for faster searching
        const nameMap = {};
        savedNames.forEach(({ friendId, friendName }) => {
            nameMap[friendId] = friendName;
        });

        // Attach unread status and replace userId with friendName if available
        const usersData = uniqueUserIds.map((id) => ({
            userId: id,
            name: nameMap[id] || id, // Replace with friendName if found
            hasUnreadMessages: unseenUserIds.includes(id),
        }));
        return res.json({
            success: true,
            users: usersData, // Both seen/unseen status
        });
    } catch (err) {
        console.error("Error fetching chat users:", err);
       return res.status(500).json({ error: "Server error" });
    }
};

exports.getName = async (req, res) => {
    try {
        const userId1 = req.userId;
        const userId2 = req.fields.friendId;
        if (!userId1 || !userId2) {
            return res.status(400).json({ error: "improper data" });
        }
        const friendName = await SetName.findOne({ userId: userId1, friendId: userId2 }, "friendName");
        if(!friendName){
            return res.status(404).json({error : "not found"});
        }
       return  res.status(200).json({ name: friendName });
    }
    catch (err) {
        console.error("Error fetching chat users:", err);
       return res.status(500).json({ error: "Server error" });
    }
}

