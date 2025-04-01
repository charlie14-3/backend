const express = require("express");
const Profile = require("../models/Profile");
const multer = require("multer"); // ✅ Import Multer
const path = require("path");
const router = express.Router();

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store images in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
});

const upload = multer({ storage });

// ✅ Serve uploaded files statically
router.use("/uploads", express.static("uploads"));

// ✅ Fetch User Profile
// ✅ Fetch User Profile
router.get("/:name", async (req, res) => {
    try {
        const user = await Profile.findOne({ name: req.params.name });
        if (!user) return res.status(404).json({ error: "Profile not found" });

        // ✅ Determine user type
        const isAlumni = user.occupation || user.sector;
        const userType = isAlumni ? "alumni" : "student";

        res.status(200).json({ ...user.toObject(), type: userType });
    } catch (err) {
        console.error("❌ Error fetching profile:", err);
        res.status(500).json({ error: err.message });
    }
});


// ✅ Update Profile (With Profile Picture)
router.post("/update", upload.single("profilePic"), async (req, res) => {
    try {
        const { name, department, degree, about, occupation, sector } = req.body;
        const profilePic = req.file ? req.file.filename : null; // ✅ Store image filename
        let user = await Profile.findOne({ name });

        if (!user) {
            user = new Profile({ name, department, degree, about, profilePic });
        } else {
            user.department = department;
            user.degree = degree;
            user.about = about;
            user.occupation = occupation;
            user.sector = sector;

            if (profilePic) user.profilePic = profilePic;
        }

        await user.save();
        res.status(200).json(user);
    } catch (err) {
        console.error("❌ Error updating profile:", err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
