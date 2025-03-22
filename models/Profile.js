const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    department: { type: String, default: "" },
    degree: { type: String, default: "" },
    about: { type: String, default: "" },
    profilePic: { type: String, default: "" } // ✅ Added profile picture field
});

module.exports = mongoose.model("Profile", ProfileSchema);
