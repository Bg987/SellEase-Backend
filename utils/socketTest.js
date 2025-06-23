const io = require("socket.io-client");

const SERVER_URL = "http://localhost:5000"; // Update if hosted remotely
const NUM_USERS = 10; // Increase gradually: 10, 20, 50, 100...
const MESSAGE_INTERVAL = 3000;
const TEST_DURATION = 5000;

const users = [];
let latencyResults = [];

function simulateUser(userId) {
    const socket = io(SERVER_URL, {
        reconnection: false
    });

    socket.on("connect", () => {
        socket.emit("join", userId);

        const interval = setInterval(() => {
            let receiverId;
            do {
                receiverId = Math.floor(Math.random() * NUM_USERS) + 1;
            } while (receiverId === userId);

            const messagePayload = {
                senderId: userId,
                receiverId,
                message: `Hi from ${userId} to ${receiverId}`,
                clientSentTime: Date.now()
            };

            socket.emit("sendMessage", messagePayload);
        }, MESSAGE_INTERVAL);

        setTimeout(() => {
            clearInterval(interval);
            socket.disconnect();
        }, TEST_DURATION);
    });

    socket.on("receiveMessage", (msg) => {
        if (msg.clientSentTime) {
            const latency = Date.now() - msg.clientSentTime;
            latencyResults.push(latency);
            console.log(`Latency: ${latency}ms | ${msg.senderId} -> ${msg.receiverId}`);
        }
    });

    socket.on("disconnect", () => {
        if (users.every(u => u.disconnected)) {
            summarizeLatency();
        }
    });

    socket.on("disconnect", () => {
        socket.disconnected = true;
        if (users.every(u => u.disconnected)) {
            summarizeLatency();
        }
    });

    users.push(socket);
}

function summarizeLatency() {
    if (latencyResults.length === 0) {
        console.log("❌ No messages received.");
        return;
    }

    const avg = (latencyResults.reduce((a, b) => a + b, 0) / latencyResults.length).toFixed(2);
    const max = Math.max(...latencyResults);
    const min = Math.min(...latencyResults);

    console.log(`\n📊 Latency Summary with ${NUM_USERS} users:`);
    console.log(`Average latency: ${avg} ms`);
    console.log(`Max latency: ${max} ms`);
    console.log(`Min latency: ${min} ms`);
    process.exit(0);
}

// Start test
for (let i = 1; i <= NUM_USERS; i++) {
    simulateUser(i);
}
