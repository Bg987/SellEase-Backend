const nodemailer = require('nodemailer');
const sgTransport = require("nodemailer-sendgrid");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport(
  sgTransport({
    apiKey: process.env.Mail_API_KEY,
  })
);
// Convert sendMail into a Promise-based function
const sendMail = async (email, msg,subject) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
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
