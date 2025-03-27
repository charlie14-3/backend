const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Alumni = require("../models/Alumni");  // Make sure the path is correct based on your file structure

const router = express.Router();

const crypto = require("crypto");
const nodemailer = require("nodemailer");
// 🔐 Store tokens temporarily (in-memory or you can use MongoDB if preferred)
let resetTokens = {}; // key: email, value: token

// ✅ Reusable mail sender function
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"EES IIT BHU" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset - EES Alumni",
    html: `
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If the button doesn't work, use this link:</p>
      <p>${resetLink}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

router.post("/request-reset", async (req, res) => {
    const { email } = req.body;
  
    try {
      const alumni = await Alumni.findOne({ email });
      if (!alumni) return res.status(404).json({ message: "Alumni not found" });
  
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = Date.now() + 1000 * 60 * 15; // 15 min expiry
  
      alumni.resetToken = token;
      alumni.resetTokenExpiry = expiry;
      await alumni.save();
  
      await sendResetEmail(email, token); // ✅ SEND EMAIL HERE
  
      res.status(200).json({ message: "Reset email sent successfully" });
    } catch (err) {
      console.error("❌ Error requesting password reset:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const alumni = await Alumni.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!alumni) return res.status(400).json({ message: "Invalid or expired token" });

        const hashedPassword = await bcrypt.hash(password, 10);
        alumni.password = hashedPassword;
        alumni.resetToken = undefined;
        alumni.resetTokenExpiry = undefined;

        await alumni.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});





// ✅ Alumni Login Route (MongoDB)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        console.log("🔄 Checking if alumni exists...");
        // 🔹 Check if alumni exists in MongoDB
        const alumni = await Alumni.findOne({ email: new RegExp('^' + email + '$', 'i') });
        console.log("Alumni found in database:", alumni);  // Add this line to check what data is returned

        if (!alumni) {
            return res.status(401).json({ message: `Alumni not found with the email: ${email}` });
        }

        if (!alumni) {
            console.error("❌ Alumni not found with the email:", email);
            return res.status(401).json({ message: "Alumni not found. Please register." });
        }

        console.log("🔄 Alumni found, verifying password...");

        // 🔹 Compare password
        console.log("Password entered:", password);  // Log the entered password
        console.log("Stored password hash:", alumni.password);  // Log the stored hash
        const isMatch = await bcrypt.compare(password, alumni.password);
        console.log("Password match:", isMatch);  // Log the result of comparison

        if (!isMatch) {
            console.error("❌ Invalid password for email:", email);
            return res.status(401).json({ message: "Invalid password." });
        }

        console.log("🔄 Password matched, generating token...");
        // 🔹 Generate JWT token
        const token = jwt.sign(
            { id: alumni._id, email: alumni.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            alumni: {
                name: alumni.name,
                occupation: alumni.occupation,
                email: alumni.email,
                photo: alumni.photo,
                sector: alumni.sector,
            },
            token,
        });
    } catch (err) {
        console.error("❌ Error logging in:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



//extra
// Backend code for fetching data from Google Sheets
// ✅ Get all alumni from MongoDB
router.get("/", async (req, res) => {
    try {
        const alumni = await Alumni.find({}, { password: 0, __v: 0 }); // exclude password and version key
        res.status(200).json(alumni);
    } catch (err) {
        console.error("❌ Error fetching alumni from DB:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




module.exports = router;
