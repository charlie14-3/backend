const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Change this if frontend is hosted elsewhere
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());

//profilepic
app.use("/uploads", express.static("uploads"));


// Import Routes
const alumniRoutes = require("./routes/alumniRoutes");
const forumRoutes = require("./routes/forumRoutes");
const chatRoutes = require("./routes/chatRoutes");
const profileRoutes = require("./routes/profileRoutes"); // ✅ Add this
const contactRoutes = require("./routes/contactRoutes");
app.use("/contact", contactRoutes);

app.use("/alumni", alumniRoutes);
app.use("/forum", forumRoutes);
app.use("/chat", chatRoutes);
app.use("/profile", profileRoutes); // ✅ Add this

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Socket.io for Real-Time Chat
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
