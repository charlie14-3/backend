const express = require("express");
const Thread = require("../models/Thread");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Store images locally (Use cloud storage for production)

const router = express.Router();

// 📌 **CREATE A NEW THREAD**
router.post("/create-thread", upload.single("image"), async (req, res) => {
    const { name, title, content, tags } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : ""; // Save image path

    if (!name || !title || !content) {
        return res.status(400).json({ message: "Name, title, and content are required" });
    }

    try {
        const newThread = new Thread({
            name,
            title,
            content,
            image,
            tags: tags ? tags.split(",") : [],
            replies: []
        });

        await newThread.save();
        res.status(201).json(newThread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 **CREATE A NEW POLL**
router.post("/create-poll", async (req, res) => {
    const { name, pollQuestion, pollOptions } = req.body;

    if (!name || !pollQuestion || !pollOptions || pollOptions.length < 2) {
        return res.status(400).json({ message: "Poll question and at least two options are required" });
    }

    try {
        const newPoll = new Thread({
            name,
            poll: {
                question: pollQuestion,
                options: pollOptions.map(opt => ({ option: opt, votes: 0 })),
                votedUsers: {}
            }
        });

        await newPoll.save();
        res.status(201).json(newPoll);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 **GET ALL THREADS AND POLLS**
router.get("/", async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 });
        res.json(threads);
    } catch (err) {
        console.error("Error fetching threads:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch only polls
router.get("/polls", async (req, res) => {
    try {
        const polls = await Thread.find({ "poll.question": { $ne: "" } }).sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        console.error("Error fetching polls:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 GET ALL THREADS WITH SORTING
router.get("/threads", async (req, res) => {
    const sort = req.query.sort || "latest"; // default sort

    let sortQuery = { createdAt: -1 }; // default: latest
    if (sort === "upvotes") sortQuery = { upvotes: -1 };
    if (sort === "downvotes") sortQuery = { downvotes: -1 };

    try {
        const threads = await Thread.find().sort(sortQuery);
        res.json(threads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 📌 **GET THREADS CREATED BY A USER**
router.get("/my-posts/:name", async (req, res) => {
    try {
        const { name } = req.params;

        const threads = await Thread.find({ name });
        res.json(threads);
    } catch (err) {
        console.error("Error fetching user's posts:", err);
        res.status(500).json({ error: err.message });
    }
});



// 📌 **GET A SINGLE THREAD OR POLL**
router.get("/:id", async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        res.json(thread);
    } catch (err) {
        console.error("Error fetching thread:", err);
        res.status(500).json({ error: err.message });
    }
});






// 📌 **ADD REPLY TO A THREAD**
router.post("/:id/reply", async (req, res) => {
    const { id } = req.params;
    const { name, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ message: "Name and message are required" });
    }

    try {
        const thread = await Thread.findById(id);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        thread.replies.push({ name, message });
        await thread.save();

        res.json(thread);
    } catch (err) {
        console.error("Error replying to thread:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 **DELETE A THREAD**
router.delete("/:id", async (req, res) => {
    try {
        const { name } = req.query; // ✅ Get name from query params
        const thread = await Thread.findById(req.params.id);

        if (!thread) return res.status(404).json({ message: "Thread not found" });

        // ✅ Ensure only the creator can delete the thread
        if (thread.name !== name) {
            return res.status(403).json({ message: "You can only delete your own thread" });
        }

        await thread.deleteOne();
        res.json({ message: "Thread deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 **DELETE A REPLY**
router.delete("/:threadId/reply/:replyId/:name", async (req, res) => {
    try {
        const { threadId, replyId, name } = req.params;
        const thread = await Thread.findById(threadId);
        if (!thread) return res.status(404).json({ message: "Thread not found" });

        // ✅ Find the reply
        const reply = thread.replies.find(r => r._id.toString() === replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found" });

        // ✅ Check if the user deleting is the original author
        if (reply.name !== name) {
            return res.status(403).json({ message: "You can only delete your own reply." });
        }

        // ✅ Remove the reply
        thread.replies = thread.replies.filter(r => r._id.toString() !== replyId);
        await thread.save();

        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 VOTE IN A POLL
// 📌 VOTE IN A POLL
router.post("/:id/poll", async (req, res) => {
    const { id } = req.params;
    const { userId, optionIndex } = req.body;

    try {
        const thread = await Thread.findById(id);
        if (!thread) return res.status(404).json({ message: "Poll not found" });

        if (!thread.poll || optionIndex < 0 || optionIndex >= thread.poll.options.length)
            return res.status(400).json({ message: "Invalid poll option" });

        // ✅ Fix: Check if user has already voted (now works for alumni too)
        if (thread.poll.votedUsers.get(userId)) {
            return res.status(400).json({ message: "You have already voted" });
        }
        

        thread.poll.options[optionIndex].votes += 1;

        // ✅ Fix: Track the userId
        thread.poll.votedUsers.set(userId, true);


        await thread.save();
        res.json(thread);
    } catch (err) {
        console.error("❌ Error voting in poll:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 UPVOTE or DOWNVOTE a thread or poll
router.post("/:id/vote", async (req, res) => {
    const { userId, type } = req.body; // type = "upvote" or "downvote"
    const { id } = req.params;
  
    if (!["upvote", "downvote"].includes(type)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }
  
    try {
      const thread = await Thread.findById(id);
      if (!thread) return res.status(404).json({ message: "Thread or poll not found" });
  
      const previousVote = thread.votes.usersVoted.get(userId);
  
      // Undo previous vote
      if (previousVote === "upvote") thread.votes.upvotes--;
      if (previousVote === "downvote") thread.votes.downvotes--;
  
      // Apply new vote
      if (type === "upvote") thread.votes.upvotes++;
      if (type === "downvote") thread.votes.downvotes++;
  
      thread.votes.usersVoted.set(userId, type);
  
      await thread.save();
      res.json(thread);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  





module.exports = router;
