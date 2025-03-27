const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendMail } = require("../utils/Email");
const { generateId } = require("../utils/IdGenerator");
const { generateOTP } = require("../utils/OtpGenerator");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
// Step 1: Signup - Generate JWT & Send OTP
const signup = async (req, res) => {
    try {
        console.log("req");
        const { username, email, password, mobile, city } = req.fields;
        if(mobile.toString().length!=10||Number.isNaN(mobile)){
            return res.status(400).json({ success: false, message: "Mobile Number must be 10 digits" });
        }
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email }, { mobile: mobile }]
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email or mobile already exists" });
        }
        const otp = generateOTP();
        // Generate OTP
        const otpString = `OTP For Login ${otp}`;

        // Create JWT with user data & OTP
        const token = jwt.sign(
            { username, email, password, mobile, city, otp },
            JWT_SECRET,
            { expiresIn: "15m" } // Expires in 5 minutes
        );

        // Send OTP via email
        const mailStatus = await sendMail(email, otpString);
        if (mailStatus) {
            res.status(200).json({ token, message: "OTP sent successfully" });
        }
        else {
            res.status(500).json({ error: "Failed to send OTP" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};
const verifyOTP = async (req, res) => {
    try {
        const { otp, token } = req.fields;
        // Decode JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded) return res.status(400).json({ message: "Invalid token" });

        // Check OTP
        if (parseInt(decoded.otp, 10) !== parseInt(otp, 10)) {
            return res.status(400).json({ message: "Incorrect OTP" });
        }

        
        // Ensure password exists
        if (!decoded.password) {
            return res.status(400).json({ message: "Missing password" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(decoded.password, 10);
        //console.log("Password hashed successfully");

        // Create user object
        const newUser = new User({
            userId: generateId(),
            username: decoded.username,
            email: decoded.email,
            password: hashedPassword,
            mobile: decoded.mobile,
            city: decoded.city,
        });


        // Save user to database
        await newUser.save();
        // Send success response and return to stop further execution
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "OTP verification failed", details: error.message });
    }
};

// Step 3: Login & Store JWT in Cookies
const login = async (req, res) => {
    try {
        const { email, password } = req.fields;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "7d" });
        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000,
            secure : true
        });
        res.status(200).json({ message: "Login successful", userId: user.userId, Uname: user.username, city : user.city });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Login failed" });
    }
};

const logout = async (req, res) => {
    try {
        res.cookie("token", "", { expires: new Date(0), httpOnly: true }); // Clear JWT token from cookies
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
};

module.exports = { signup, verifyOTP, login, logout };
