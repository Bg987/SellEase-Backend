const Chat = require("../models/chat"); // Import Chat model

// Store online users (store socket ID per userId)
const users = {};

const setupSocketIo = (io) => {
    io.on("connection", (socket) => {
        // When a user joins, store their socket ID and assign them to a room based on userId
        socket.on("join", (userId) => {
            users[userId] = socket.id;
            socket.join(userId); // Join the room corresponding to the userId
            //console.log(`User ${userId} joined room with socket ID: ${socket.id}`);
        });

        // Send message from sender to receiver
        socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
            try {
                const newMessage = new Chat({
                    senderId,
                    receiverId,
                    message,
                    timestamp: new Date(),
                    read: false, // Initially set to false because it is not read yet
                });
                console.log(newMessage);
                await newMessage.save();
                //console.log("Message saved:", newMessage);

                // Emit the message only to the intended recipient's room (receiverId)
                if (users[receiverId]) {
                    // Mark the message as read because the receiver is online
                     await newMessage.save(); // Update the message in the database to mark it as read
                    io.to(receiverId).emit("receiveMessage", newMessage);
                  //  console.log(`Message sent to ${receiverId}`);
                } else {
                    //console.log(`Receiver ${receiverId} is not online`);
                }

            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        // Handle user disconnect (optional, if you need to clean up)
        socket.on("disconnect", () => {
            for (let userId in users) {
                if (users[userId] === socket.id) {
                    delete users[userId]; // Remove user from online list when they disconnect
                    break;
                }
            }
        });
    });
};

module.exports = setupSocketIo;
