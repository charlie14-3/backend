const express = require("express");
const Profile = require("../models/Profile");
const router = express.Router();

// ✅ Fetch User Profile
router.get("/:name", async (req, res) => {
    try {
        const user = await Profile.findOne({ name: req.params.name });
        if (!user) return res.status(404).json({ error: "Profile not found" });
        res.status(200).json(user);
    } catch (err) {
        console.error("❌ Error fetching profile:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update Profile
router.post("/update", async (req, res) => {
    try {
        const { name, department, degree, about } = req.body;
        let user = await Profile.findOne({ name });

        if (!user) {
            user = new Profile({ name, department, degree, about });
        } else {
            user.department = department;
            user.degree = degree;
            user.about = about;
        }

        await user.save();
        res.status(200).json(user);
    } catch (err) {
        console.error("❌ Error updating profile:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
