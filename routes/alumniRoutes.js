const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const credentials = require("../config/google-sheets.json"); // Ensure this file exists

const SHEET_ID = "1rYbaHwO6064zsZ9V988eJTnL2TAhg9b3jtnWds8sDxM"; // ✅ Update with actual Sheet ID
const RANGE = "Dummy_Alumni_Data!A2:C"; // ✅ Ensure this matches your Google Sheets structure

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ✅ Fetch Alumni Data (Existing Functionality)
router.get("/", async (req, res) => {
    try {
        const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: RANGE });

        console.log("📌 Raw API Response:", response.data); // Debugging

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log("❌ No data found in Google Sheet.");
            return res.status(404).json({ message: "No alumni data found" });
        }

        const alumniList = rows.map(row => ({
            name: row[0] || "Unknown",
            occupation: row[1] || "Not Available",
            email: row[2] || "Not Provided"
        }));

        console.log("✅ Processed Alumni Data:", alumniList); // Debugging
        res.json(alumniList);
    } catch (error) {
        console.error("❌ Error fetching alumni data:", error);
        res.status(500).json({ error: "Failed to fetch alumni data" });
    }
});

// ✅ Add Alumni Data to Google Sheets (New Feature)
router.post("/add", async (req, res) => {
    const { name, email, occupation } = req.body;

    if (!name || !email || !occupation) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: RANGE,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: [[name, email, occupation]],
            },
        });

        console.log("✅ Alumni Data Added:", { name, email, occupation });
        res.json({ success: true, message: "Alumni data added successfully" });
    } catch (error) {
        console.error("❌ Error adding alumni data:", error);
        res.status(500).json({ success: false, message: "Failed to add alumni data" });
    }
});

module.exports = router;
