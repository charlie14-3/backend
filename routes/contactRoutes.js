const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// ✅ Email Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "vermasourabh487@gmail.com", // Replace with your email
        pass: "wkjl fsow ltgz emfz" // Use an App Password, not your real password
    }
});

// ✅ Contact Form API Route
router.post("/send", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const mailOptions = {
        from: email,
        to: "vermasourabh487@gmail.com", // Replace with the recipient's email
        subject: `New Contact Form Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: "Message sent successfully!" });
    } catch (err) {
        console.error("❌ Error sending email:", err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

module.exports = router;
