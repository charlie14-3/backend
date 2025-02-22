const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema({
    name: { type: String, required: true }, // User who started the thread
    title: { type: String, required: true },
    replies: [
        {
            name: { type: String, required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Thread", ThreadSchema);
