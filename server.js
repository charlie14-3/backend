const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const alumniRoutes = require("./routes/alumniRoutes");
const forumRoutes = require("./routes/forumRoutes");
const chatRoutes = require("./routes/chatRoutes"); // ✅ Ensure this is correctly imported

const app = express();
app.use(express.json()); // ✅ Enable JSON handling

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());

// ✅ Ensure routes are used correctly
app.use("/alumni", alumniRoutes);
app.use("/forum", forumRoutes);
app.use("/chat", chatRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Ensure `chatRoutes.js` is correctly exported
io.on("connection", (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);

    socket.on("send_message", (data) => {
        io.emit(`receive_message_${data.receiver}`, data);
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected");
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
