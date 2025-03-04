const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    occupation: { type: String, required: true },
    interests: { type: String },
    experience: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alumni", AlumniSchema);
