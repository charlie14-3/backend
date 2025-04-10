const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const Alumni = require("./models/Alumni");  // Add this line at the top of server.js
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Socket.IO not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});


app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

// CORS for Express REST APIs
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  credentials: true,
}));

  
  
//profilepic
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


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


app.use(express.static(path.join(__dirname, "build")));

// React catch-all: this must come last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));
    mongoose.connection.once("open", () => {
        console.log("Connected to MongoDB Atlas successfully.");
      });
      const testConnection = async () => {
        const alumniCount = await Alumni.countDocuments();
        console.log("Number of alumni in database:", alumniCount);
      };
      testConnection();
      

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
