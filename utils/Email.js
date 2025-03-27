const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Convert sendMail into a Promise-based function
const sendMail = async (email, msg) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code for Registration',
            text: msg,
        });

        //console.log("Email sent successfully to:", email);
        return true;
    } catch (error) {
        console.error("Error in email module:", error);
        return false;
    }
};

module.exports = { sendMail };
