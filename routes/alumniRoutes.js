const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library"); // ✅ Required for authentication
const Alumni = require("../models/Alumni");
require("dotenv").config();

const router = express.Router();

// ✅ Google Sheets Setup
const googleAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // ✅ Fix newline issues
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, googleAuth);

// ✅ Function to Connect to Google Sheets
const connectToGoogleSheet = async () => {
    try {
        console.log("🔄 Connecting to Google Sheets...");
        await doc.loadInfo(); // ✅ Load Sheet Info
        console.log(`✅ Connected to Google Sheet: ${doc.title}`);
        return doc;
    } catch (err) {
        console.error("❌ Google Sheets Auth Error:", err);
        throw err;
    }
};

// ✅ Alumni Registration Route
router.post("/register", async (req, res) => {
    const { name, email, password, occupation, interests, experience } = req.body;

    if (!name || !email || !password || !occupation) {
        return res.status(400).json({ message: "All required fields must be filled." });
    }

    try {
        // 🔹 Check if alumni already exists
        const existingAlumni = await Alumni.findOne({ email });
        if (existingAlumni) {
            return res.status(400).json({ message: "Alumni already registered. Please log in." });
        }

        // 🔹 Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔹 Save alumni in MongoDB
        const newAlumni = new Alumni({ name, email, password: hashedPassword, occupation, interests, experience });
        await newAlumni.save();

        // 🔹 Save data in Google Sheets
        const doc = await connectToGoogleSheet(); // ✅ Ensure authentication before using
        const sheet = doc.sheetsByIndex[0]; // ✅ Select the first sheet
        await sheet.loadHeaderRow(); // ✅ Load headers

        // ✅ Append row to Google Sheets
        await sheet.addRow({
            Name: name || "Unknown",  // ✅ Ensures name is not blank
            Email: email,
            Occupation: occupation,
            Interests: interests || "Not Provided",
            Experience: experience || "Not Provided",
        });

        console.log("✅ Google Sheets Updated Successfully!");

        res.status(201).json({ message: "Alumni registered successfully!" });
    } catch (err) {
        console.error("❌ Error registering alumni:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ Alumni Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // 🔹 Check if alumni exists
        const alumni = await Alumni.findOne({ email });
        if (!alumni) {
            return res.status(401).json({ message: "Alumni not found. Please register." });
        }

        // 🔹 Compare passwords
        const isMatch = await bcrypt.compare(password, alumni.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // 🔹 Generate JWT token
        const token = jwt.sign({ id: alumni._id, email: alumni.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", alumni, token });
    } catch (err) {
        console.error("❌ Error logging in:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


//extra
// ✅ Fetch Alumni from Google Sheets & MongoDB
router.get("/", async (req, res) => {
    try {
        console.log("🔄 Fetching alumni data...");

        // 🔹 Connect to Google Sheets
        const doc = await connectToGoogleSheet();
        const sheet = doc.sheetsByIndex[0]; // ✅ Select first sheet
        await sheet.loadHeaderRow(); // ✅ Load headers

        // 🔹 Read rows from Google Sheets
        const rows = await sheet.getRows();
        const googleAlumni = rows.map(row => ({
            name: row.Name || "Unknown",
            occupation: row.Occupation || "Not Provided",
        }));

        // 🔹 Fetch alumni from MongoDB
        const dbAlumni = await Alumni.find({}, "name occupation -_id");

        // 🔹 Merge data
        const mergedAlumni = [...dbAlumni, ...googleAlumni];

        console.log("✅ Alumni data fetched successfully!");

        res.status(200).json(mergedAlumni);
    } catch (err) {
        console.error("❌ Error fetching alumni data:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;
