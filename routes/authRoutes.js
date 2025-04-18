const express = require("express");
const { signup, verifyOTP, login,logout,forgotPassword } = require("../controller/authController");
const router = express.Router();

router.post("/signup", signup);   // Step 1: Send OTP
router.post("/verify-otp", verifyOTP); // Step 2: Verify OTP & create user
router.post("/login", login);     // Login user
router.post("/logout", logout); // Logout route
router.post("/Forgot_Password", forgotPassword); // Logout route

module.exports = router;
