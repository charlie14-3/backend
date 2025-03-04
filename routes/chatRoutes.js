const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();

// ✅ Get list of users the logged-in user has chatted with
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

// ✅ Get last message between two users
router.get("/last-message/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const lastMessage = await Chat.findOne({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(lastMessage);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch last message" });
    }
});

// ✅ Get chat messages between two users
router.get("/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const messages = await Chat.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete a specific message
router.delete("/delete-message/:messageId", async (req, res) => {
    const { messageId } = req.params;

    try {
        const deletedMessage = await Chat.findByIdAndDelete(messageId);
        if (!deletedMessage) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete an entire chat
router.delete("/delete-chat/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        await Chat.deleteMany({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        });

        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ✅ Send a new message
router.post("/send", async (req, res) => {
    const { sender, receiver, message } = req.body;
    try {
        const newMessage = new Chat({ sender, receiver, message });
        await newMessage.save();
        
        // Emit real-time message event (if using socket.io)
        req.app.get("io").emit("receive_message", newMessage);

        res.status(200).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
