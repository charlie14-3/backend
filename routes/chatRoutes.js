const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();

// Get chat list
router.get("/users/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const chats = await Chat.find({
            $or: [{ sender: username }, { receiver: username }]
        });

        const chatList = new Set();
        chats.forEach(chat => {
            chatList.add(chat.sender === username ? chat.receiver : chat.sender);
        });

        res.status(200).json([...chatList]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages between two users
router.get("/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const messages = await Chat.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ _id: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send a message
router.post("/send", async (req, res) => {
    const { sender, receiver, message } = req.body;
    try {
        const newMessage = new Chat({ sender, receiver, message });
        await newMessage.save();
        res.status(200).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Correctly export router
module.exports = router;
