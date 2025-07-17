const Chat = require("../models/chat");
const axios = require("axios");

const users = {}; // { userId: socket.id }

const setupSocketIo = (io) => {
    io.on("connection", (socket) => {

        socket.on("join", (userId) => {
            socket.userId = userId; // Associate this socket with a user
            users[userId] = socket.id;
            socket.join(userId);
        });

        socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
            try {
                // 1. Save new message
                const newMessage = new Chat({
                    senderId,
                    receiverId,
                    message,
                    timestamp: new Date(),
                    read: false,
                });
                await newMessage.save();

                // 2. Emit the message to the receiver (normal delivery)
                if (users[receiverId]) {
                    io.to(receiverId).emit("receiveMessage", newMessage);
                }

                // Only generate suggestions if receiver is the logged-in user
                const receiverSocketId = users[receiverId];
                if (receiverSocketId) {
                    // 4. Get last 5 messages between both users
                    const lastMessages = await Chat.find({
                        $or: [
                            { senderId, receiverId },
                            { senderId: receiverId, receiverId: senderId },
                        ]
                    }).sort({ timestamp: -1 }).limit(10);

                    // 3. Build chat context
                    const prompt = `This is a conversation between two users on a second-hand marketplace app for items like electronics, appliances, and vehicles.\n` +
                        `Based on the recent chat, suggest 3 short, polite and context-aware replies to help continue the conversation, show interest, or negotiate.\n\nConversation:\n` +
                        lastMessages.reverse().map(m =>
                            `${m.senderId === receiverId ? "You" : "Other"}: ${m.message}`
                        ).join('\n');


                    // 5. Call Cohere
                    const aiRes = await axios.post("https://api.cohere.ai/generate", {
                        model: "command",
                        prompt,
                        max_tokens: 60,
                        temperature: 0.7,
                    }, {
                        headers: {
                            Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                            "Content-Type": "application/json"
                        }
                    });

                    // 6. Extract suggestions
                    const rawText = aiRes.data.text || "";
                    const suggestions = rawText
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => /^[0-9]+\.\s*["“”']?(.*)["“”']?$/.test(line))
                        .map(line => {
                            const match = line.match(/^[0-9]+\.\s*["“”']?(.*)["“”']?$/);
                            return match ? match[1].trim() : null;
                        })
                        .filter(Boolean);

                    // 7. Emit to the **receiver only**
                    io.to(receiverId).emit("aiSuggestions", suggestions);

                    // 8. Optionally: Save in DB for logging
                    newMessage.suggestions = suggestions;
                    await newMessage.save();
                }

            } catch (error) {
                console.error("Error handling sendMessage:", error);
            }
        });
        const axios = require("axios");
        const Chat = require("../models/chat"); // assuming already imported at the top

        socket.on("requestSuggestions", async ({ senderId, receiverId }) => {
            try {
                // 1. Fetch last 5 messages between these two users
                const lastMessages = await Chat.find({
                    $or: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                }).sort({ timestamp: -1 }).limit(9);

                if (!lastMessages.length) return;

                // 2. Reverse to get actual conversation order
                const chatContext = lastMessages.reverse().map(m =>
                    `${m.senderId === senderId ? "You" : "Other"}: ${m.message}`
                ).join('\n');

                // 3. Create role-aware prompt
                const prompt = `You are helping a user chat on a second-hand marketplace app for items like electronics, appliances, and vehicles.\n` +
                    `Based on the following conversation, detect seller and buyer and suggest 4 short, polite, and context-aware replies\n\n` +
                    chatContext;

                // 4. Call Cohere AI
                const aiRes = await axios.post("https://api.cohere.ai/generate", {
                    model: "command",
                    prompt,
                    max_tokens: 100,
                    temperature: 0.7,
                }, {
                    headers: {
                        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                });

                // 5. Extract suggestions
                const suggestions = aiRes.data.text
                    .split('\n')
                    .map(s => s.trim())
                    .filter(Boolean)
                    .filter(s => /^[0-9.]*\s?["“”']?.+/.test(s)) // Optional: keep only clean suggestions

                // 6. Emit suggestions back to sender
                io.to(senderId).emit("aiSuggestions", suggestions);

            } catch (error) {
                console.error("Error in requestSuggestions:", error);
            }
        });

        socket.on("disconnect", () => {
            if (socket.userId) {
                delete users[socket.userId];
            }
        });
    });
};

module.exports = setupSocketIo;
