const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const cors = require("cors");
const formidable = require("express-formidable");


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["https://sell-ease-frontend-w8.vercel.app","http://192.168.254.47:5173"], // Frontend URL
        methods: ["GET", "POST"],
        credentials: true // Allows sending cookies & authentication headers
    }
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const sellRoutes = require("./routes/sellRoutes");
const hisRoutes = require("./routes/hisRoutes");
const buyRoutes = require("./routes/buyRoutes");
const chatRoutes = require("./routes/chatRoutes");
const verifyToken = require("./middleware/authMiddleware");

// Import socket setup
const setupSocketIo = require("./utils/chatSocket");
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://192.168.254.47:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    //"https://sell-ease-frontend-w8.vercel.app"
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Then apply the CORS package
app.use(cors({
    origin: ["https://sell-ease-frontend-w8.vercel.app","http://192.168.254.47:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Middleware
app.use("/uploads", express.static("data/uploads"));
app.use(formidable());
app.use(cookieParser());
app.use(cors({
    origin: ["https://sell-ease-frontend-w8.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.get("/test",(req,res)=>{
    res.status(200).send("Hello World");
})
// Routes
app.use("/auth", authRoutes);
app.use("/sell", verifyToken, sellRoutes);
app.use("/history", verifyToken, hisRoutes);
app.use("/buy", verifyToken, buyRoutes);
app.use("/api/chat", chatRoutes);

// Setup socket.io
setupSocketIo(io);

// Connect to MongoDB and start the server
mongoose.connect('mongodb+srv://220170116016:GulEviirQbnM7S2x@clusterbg.2ubxl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterBg')
    .then(() => {
        console.log("Database connected successfully");
        server.listen(5000, () => {
            console.log(`Server running on port 5000`);
        });
    })
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
    });
