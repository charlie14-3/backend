const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema({
    name: { type: String, required: true }, // User who created the thread or poll
    title: { type: String, default: "" }, // Title (optional for polls)
    content: { type: String, default: "" }, // Content (only for threads)
    image: { type: String, default: "" }, // Store image URL (optional)
    tags: { type: [String], default: [] }, // Array of tags
    votes: {
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        usersVoted: { type: Map, of: String, default: {} } // Tracks user votes
    },
    replies: [
        {
            name: { type: String, required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    poll: {
        question: { type: String, default: "" },
        options: [{ option: String, votes: { type: Number, default: 0 } }],
        votedUsers: { type: Map, of: Boolean, default: {} } // Prevents duplicate voting
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Thread", ThreadSchema);
