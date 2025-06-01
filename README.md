# 🛒 SellEase

The **SellEase Backend** is a powerful Node.js and Express.js REST API designed for a second-hand item marketplace. It supports secure user authentication, item listings (buy/sell), chat functionality, feedback system, and admin controls. Built on the **MERN stack**, it uses **MongoDB** for flexible data handling and **Socket.IO** for real-time chat and dashboard updates.

---

## 🚀 Features

- 🔐 User Authentication (Signup, Login with OTP email verification)
- 📦 Sell Item – Users can list second-hand items with images (automobiles, electronics, appliances)
- 🛍 Buy Item – Buyers can view and purchase listed items
- 💬 Chat Functionality – Real-time chat between buyer and seller using Socket.IO
- 📝 Feedback System – Users can rate and review sellers
- 🧑‍💼 Admin Dashboard – View real-time stats like total users, items, and active chats
- ☁️ Cloud Image Uploads via Cloudinary
- 🍪 Cookie-based Auth – Secure session handling using cookies (includes user role/id)
- 🌍 CORS-enabled for frontend-backend integration
- ☁️ Deployment – Hosted on Render and connected to MongoDB Atlas

---

## 🛠 Tech Stack

| Layer         | Tech                             |
|--------------|----------------------------------|
| Language      | JavaScript (Node.js)             |
| Runtime       | Node.js                          |
| Framework     | Express.js                       |
| Database      | MongoDB (MongoDB Atlas)          |
| Real-time     | Socket.IO                        |
| Auth & Crypto | bcrypt, cookie-parser            |
| Uploads       | express-fileupload, Cloudinary   |
| Email         | nodemailer (OTP verification)    |
| Env Config    | dotenv                           |
| Deployment    | Render + MongoDB Atlas           |
