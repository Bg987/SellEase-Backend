const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendMail } = require("../utils/Email");
const { generateId } = require("../utils/IdGenerator");
const { generateOTP } = require("../utils/OtpGenerator");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const En_SECRET = process.env.EN_SECRET;
const prod = process.env.NODE_ENV === "production" ? true : false;
// Step 1: Signup - Generate JWT & Send OTP
const signup = async (req, res) => {
    try {
        const { username, email, password, mobile, city } = req.fields;
        if (mobile.toString().length != 10 || Number.isNaN(mobile)) {
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
        const subject = `SellEase New User Sign in OTP`
        const otpString = `OTP For Login ${otp}\nexpires in 15 minutes\nDo not share this OTP with anyone`;

        // Create JWT with user data & OTP
        const token = jwt.sign(
            { username, email, password, mobile, city, otp },
            JWT_SECRET,
            { expiresIn: "15m" } // Expires in 15 minutes
        );

        // Send OTP via email
        const mailStatus = await sendMail(email, otpString,subject);
        if (mailStatus) {
            return res.status(200).json({ token, message: "OTP sent successfully" });
        }
        else {
            return res.status(500).json({ error: "Failed to send OTP" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send OTP" });
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

        //encrypted password
        const encryptedPassword = CryptoJS.AES.encrypt(decoded.password, En_SECRET).toString();
        // Create user object
        const newUser = new User({
            userId: generateId(),
            username: decoded.username,
            email: decoded.email,
            password: encryptedPassword,
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
        if(!email||!password) return res.status(400).json({ message: "Email and password are required" });
        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        //decrypyt password
        const temp = CryptoJS.AES.decrypt(user.password, En_SECRET);
        const password123 = temp.toString(CryptoJS.enc.Utf8);
        // Compare passwords~
        if (password !== password123) return res.status(400).json({ message: "Invalid credentials" });
        // Generate JWT token
        const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "7000d" });
        if (prod) {
            //for production
            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "None",
                maxAge: 24000000 * 60 * 60 * 1000,
                secure: true
            });
        }
        else {
            // Set cookie(testing)
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 36000 * 1000, // 10 hour
                secure: false,
                sameSite: "Strict"
            });
        }
        return res.status(200).json({ message: "Login successful", userId: user.userId, Uname: user.username, city: user.city });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Login failed" });
    }
};

const logout = async (req, res) => {
    try {
        if (prod) {
            //for production
            res.clearCookie("token", {
                httpOnly: true,
                secure: true, // Ensure it's true if using HTTPS
                sameSite: "None" // Important for cross-origin requests
            });
        }
        else {
            //for testing
            res.clearCookie('token');
        }
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Logout failed" });
    }
};
const forgotPassword = async (req, res) => {
    const { email } = req.fields;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const temp = CryptoJS.AES.decrypt(user.password, En_SECRET);
        const password = temp.toString(CryptoJS.enc.Utf8);
        const subject = `Sellease User Forgot Password`;
        const message = `Your SellEase Account Password
      Here is your password:${password}
      Please keep it safe and do not share it.
    `;
        // Send email with password
        const mailStatus = await sendMail(email, message,subject);
        if (mailStatus) {
            return res.status(200).json({ message: "Password send succesfully" });
        }
        else {
            return res.status(500).json({ error: "" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong.' });
    }
}
module.exports = { signup, verifyOTP, login, logout, forgotPassword };
