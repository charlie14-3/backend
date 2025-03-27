const mongoose = require("mongoose");

const AlumniSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    occupation: { type: String },
    sector: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
});

module.exports = mongoose.model("Alumni", AlumniSchema);
