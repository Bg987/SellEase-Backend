const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
        userId: { type: String, required: true, unique: true }, // Auto-generate in Node.js
        username: { type: String, required: true },
        password: { type: String, required: true }, // Hash before saving
        email: { type: String, required: true, unique: true },
        mobile: { type: String, required: true, unique: true },
        city: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        active : {type : Boolean ,default : false}
    });
    //console.log("done123");        

 module.exports = mongoose.model("User", userSchema);
