const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    department: { type: String, default: "" },
    degree: { type: String, default: "" },
    about: { type: String, default: "" },
    profilePic: { type: String, default: "" }, // ✅ Added profile picture field

    occupation: { type: String, default: "" },   // ✅ New
    sector: { type: String, default: "" } ,     // ✅ New

    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    email: { type: String, default: "" }
    
    
});

module.exports = mongoose.model("Profile", ProfileSchema);
