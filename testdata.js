const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Chat = require("./models/chat"); // Adjust path if needed

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const testMessages = [
      {
        senderId: "user-123",  // Random sender
        receiverId: "73152508-5f82-4098-aee6-adc284579f35",
        message: "Hello! Is this item still available?",
        isRead: false,
        timestamp: new Date()
      },
      {
        senderId: "user-456",
        receiverId: "73152508-5f82-4098-aee6-adc284579f35",
        message: "Can we negotiate the price?",
        isRead: false,
        timestamp: new Date()
      },
      {
        senderId: "user-789",
        receiverId: "73152508-5f82-4098-aee6-adc284579f35",
        message: "I am interested in buying your product.",
        isRead: false,
        timestamp: new Date()
      }
    ];

    await Chat.insertMany(testMessages);
    console.log("Test messages inserted!");

    mongoose.connection.close();
  })
  .catch(err => console.error("Database error:", err));
