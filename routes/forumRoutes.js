const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Define the Thread Schema
const threadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    replies: [
        {
            name: { type: String, required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

// Create the Thread Model
const Thread = mongoose.model("Thread", threadSchema);

//
// 📌 **GET ALL THREADS**
//
router.get("/", async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 }); // Sort by latest
        res.json(threads);
    } catch (err) {
        console.error("Error fetching threads:", err);
        res.status(500).json({ error: err.message });
    }
});

//
// 📌 **CREATE A NEW THREAD**
//
router.post("/", async (req, res) => {
    const { name, title } = req.body;
    if (!name || !title) return res.status(400).json({ message: "Name and title are required" });

    try {
        const newThread = new Thread({ name, title, replies: [] });
        await newThread.save();

        // Return updated list
        const threads = await Thread.find();
        res.status(201).json(threads);
    } catch (err) {
        console.error("Error creating thread:", err);
        res.status(500).json({ error: err.message });
    }
});

//
// 📌 **ADD REPLY TO A THREAD**
//
router.post("/:id/reply", async (req, res) => {
    const { id } = req.params;
    const { name, message } = req.body;
    if (!name || !message) return res.status(400).json({ message: "Name and message are required" });

    try {
        const thread = await Thread.findById(id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        thread.replies.push({ name, message });
        await thread.save();

        res.json(thread);
    } catch (err) {
        console.error("Error replying to thread:", err);
        res.status(500).json({ error: err.message });
    }
});

//
// 📌 **DELETE A THREAD**
//
router.delete("/:id", async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        await thread.deleteOne();
        res.json({ message: "Thread deleted successfully" });
    } catch (err) {
        console.error("Error deleting thread:", err);
        res.status(500).json({ error: err.message });
    }
});

//
// 📌 **DELETE A REPLY FROM A THREAD**
//
router.delete("/:threadId/reply/:replyId", async (req, res) => {
    try {
        const { threadId, replyId } = req.params;
        const thread = await Thread.findById(threadId);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        thread.replies = thread.replies.filter(reply => reply._id.toString() !== replyId);
        await thread.save();

        res.json(thread);
    } catch (err) {
        console.error("Error deleting reply:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
