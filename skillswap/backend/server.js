const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_for_skillswap";

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Route for file upload (supports video and PDF)
app.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  console.log(`[Upload] User ${req.user.id} uploaded file: ${req.file.filename}`);
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// MongoDB connection
mongoose.set("debug", true);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });

const bcrypt = require("bcryptjs");
const { OpenAI } = require("openai");

// Initialize OpenAI conditionally so the server doesn't crash on startup if the key is missing
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000 // 10 second timeout to prevent hanging
    })
  : null;

// JWT Secret (In production, move this to .env)

// Schema definition
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  emoji: { type: String, default: "🙂" },
  teach: { type: Array, default: [] },
  learn: { type: Array, default: [] },
  careerGoal: { type: String, default: "" },
  sessions: { type: Number, default: 0 }, // Taught count
  attendCount: { type: Number, default: 0 }, // Attended count
  rating: { type: Number, default: 5.0 },
  badges: [{ 
    name: String, 
    description: String, 
    icon: String, 
    category: String, 
    unlockedAt: { type: Date, default: Date.now } 
  }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

const BADGES = [
  { name: "Beginner", description: "Completed your first peer-to-peer learning session!", icon: "🌱", category: "General" },
  { name: "Active Learner", description: "Completed 5+ learning sessions. Keep it up!", icon: "🔥", category: "Progress" },
  { name: "Mentor", description: "Conducted at least one session as a teacher. Sharing is caring!", icon: "🧑‍🏫", category: "Teaching" },
  { name: "Expert", description: "Maintained a high rating (4.8+) over 10+ total sessions. You are a pro!", icon: "🎖️", category: "Excellence" }
];

async function checkBadges(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let newBadges = [...user.badges];
    const totalSessions = (user.sessions || 0) + (user.attendCount || 0);

    // 1. Beginner (1+ sessions)
    if (totalSessions >= 1 && !newBadges.some(b => b.name === "Beginner")) {
      newBadges.push(BADGES[0]);
      console.log(`[Badge] ${user.name} earned "Beginner"`);
    }

    // 2. Active Learner (5+ sessions)
    if (totalSessions >= 5 && !newBadges.some(b => b.name === "Active Learner")) {
      newBadges.push(BADGES[1]);
      console.log(`[Badge] ${user.name} earned "Active Learner"`);
    }

    // 3. Mentor (Taught at least 1 session)
    if (user.sessions > 0 && !newBadges.some(b => b.name === "Mentor")) {
      newBadges.push(BADGES[2]);
      console.log(`[Badge] ${user.name} earned "Mentor"`);
    }

    // 4. Expert (High rating + 10+ total sessions)
    if (user.rating >= 4.8 && totalSessions >= 10 && !newBadges.some(b => b.name === "Expert")) {
      newBadges.push(BADGES[3]);
      console.log(`[Badge] ${user.name} earned "Expert"`);
    }

    if (newBadges.length > user.badges.length) {
      await User.findByIdAndUpdate(userId, { badges: newBadges });
    }
  } catch (err) {
    console.error("Check Badges Error:", err);
  }
}





const videoSchema = new mongoose.Schema({
  title: String,
  skill: String,
  videoUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);

const connectionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Connection = mongoose.model("Connection", connectionSchema);

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["video", "pdf", "notes"], default: "pdf" },
  skill: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, default: "📄" }, // Default for PDF/Notes
  duration: { type: String, default: "" }, // For videos if needed
  pages: { type: String, default: "" },    // For PDFs
  words: { type: String, default: "" },    // For notes
  createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model("Resource", resourceSchema);

const sessionSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // Format "Mar 12"
  time: { type: String, required: true }, // Format "10:00 AM"
  skill: { type: String, default: "Doubt Clearing" },
  meetingId: { type: String, unique: true },
  meetingLink: { type: String },
  status: { type: String, enum: ["booked", "confirmed", "completed", "cancelled"], default: "booked" },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model("Session", sessionSchema);

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

const reviewSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);

const videoProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  skill: { type: String, required: true },
  completed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Progress = mongoose.model("Progress", videoProgressSchema);

const skillFeedbackSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Skill creator
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});
const SkillFeedback = mongoose.model("SkillFeedback", skillFeedbackSchema);

const DEFAULT_FEEDBACKS = [
  { text: "Great mentor! Explained complex concepts very clearly.", student: { name: "Alex", emoji: "👨‍💻" }, rating: 5, isDefault: true },
  { text: "Very patient and knowledgeable. Highly recommend!", student: { name: "Sarah", emoji: "👩‍🎨" }, rating: 4, isDefault: true },
  { text: "Helped me debug my React app in no time. Awesome!", student: { name: "Mike", emoji: "🦾" }, rating: 5, isDefault: true },
  { text: "Excellent communication and deep understanding of the topic.", student: { name: "Elena", emoji: "🧠" }, rating: 5, isDefault: true },
  { text: "The session was very interactive and helpful. I learned a lot!", student: { name: "David", emoji: "🎸" }, rating: 4, isDefault: true },
  { text: "Perfect explanation of difficult concepts. Truly an expert.", student: { name: "Sophia", emoji: "🎨" }, rating: 5, isDefault: true },
  { text: "Very friendly and encouraged me to ask questions. Great experience!", student: { name: "Liam", emoji: "🚀" }, rating: 5, isDefault: true },
  { text: "Structured lessons and very clear examples. Highly satisfied.", student: { name: "Olivia", emoji: "📷" }, rating: 4, isDefault: true },
  { text: "Insightful feedback and practical tips for improvement.", student: { name: "Ethan", emoji: "🏀" }, rating: 5, isDefault: true },
  { text: "Professional and well-prepared. Looking forward to more sessions.", student: { name: "Emma", emoji: "🎭" }, rating: 5, isDefault: true },
  { text: "Amazing at breaking down backend architecture. Very clear!", student: { name: "Noah", emoji: "🏗️" }, rating: 5, isDefault: true },
  { text: "Her UI design tips changed the way I look at spacing. Quality!", student: { name: "Chloe", emoji: "💎" }, rating: 5, isDefault: true },
  { text: "Solved my Docker issues in minutes. A true pro.", student: { name: "Lucas", emoji: "🐳" }, rating: 5, isDefault: true },
  { text: "Great energy and very supportive throughout the session.", student: { name: "Mia", emoji: "✨" }, rating: 4, isDefault: true },
  { text: "Detailed and thorough. Answered all my edge-case questions.", student: { name: "James", emoji: "🕵️" }, rating: 5, isDefault: true }
];

const getRandomFeedbacks = (count = 3) => {
  const shuffled = [...DEFAULT_FEEDBACKS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Middleware to verify JWT token

// --- AUTHENTICATION ROUTES ---

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ 
      message: "User created successfully", 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, emoji: newUser.emoji, sessions: 0, rating: 5.0, careerGoal: "" } 
    });
  } catch (err) {
    console.error("Signup Error Details:", err);
    res.status(500).json({ error: err.message || "Server error during signup" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      message: "Logged in successfully", pass: true,
      token, 
      user: { id: user._id, name: user.name, email: user.email, emoji: user.emoji, bio: user.bio, teach: user.teach, learn: user.learn, sessions: user.sessions, rating: user.rating, careerGoal: user.careerGoal } 
    });
  } catch (err) {
    console.error("Login Error Details:", err);
    res.status(500).json({ error: err.message || "Server error during login" });
  }
});
app.post("/add-video", authMiddleware, async (req, res) => {
  try {
    const { title, skill, videoUrl } = req.body;
    if (!title || !skill || !videoUrl) {
      return res.status(400).json({ error: "Please provide title, skill and videoUrl" });
    }

    const newVideo = new Video({
      title,
      skill,
      videoUrl,
      uploadedBy: req.user.id,
    });

    await newVideo.save();

    res.json({ message: "Video added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Video List to only show videos from accepted connections
app.get("/videos", authMiddleware, async (req, res) => {
  try {
    const { skill } = req.query;
    console.log(`[Videos] User ${req.user.id} fetching videos...`);
    
    // Find all accepted connections for this user
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { receiver: req.user.id, status: "accepted" }
      ]
    });

    // Extract the IDs of people this user is connected with
    const connectedUserIds = connections.map(conn => 
      conn.requester.toString() === req.user.id ? conn.receiver.toString() : conn.requester.toString()
    );

    // Also include the user's own videos
    connectedUserIds.push(req.user.id);
    
    console.log(`[Videos] Authorized to see videos from: ${connectedUserIds.join(", ")}`);

    // Find videos where uploadedBy is in the authorized list
    let query = { uploadedBy: { $in: connectedUserIds } };
    
    if (skill && skill !== "All") {
      query.skill = new RegExp(skill, "i");
    }
    const videos = await Video.find(query).populate("uploadedBy", "name emoji");
    console.log(`[Videos] Found ${videos.length} videos`);
    res.json(videos);
  } catch (err) {
    console.error(`[Videos Error]`, err);
    res.status(500).json({ error: err.message });
  }
});

// --- CONNECTION ROUTES ---

app.post("/connect", authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (targetUserId === req.user.id) return res.status(400).json({ error: "Cannot connect to yourself" });

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user.id, receiver: targetUserId },
        { requester: targetUserId, receiver: req.user.id }
      ]
    });

    if (existing) return res.status(400).json({ error: "Connection already exists or pending" });

    const newConn = new Connection({ requester: req.user.id, receiver: targetUserId });
    await newConn.save();
    res.json({ message: "Match request sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/connections", authMiddleware, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }]
    }).populate("requester receiver", "name emoji bio teach learn rating sessions");

    // Fetch feedbacks for requesters to show to the receiver
    const connectionsWithFeedbacks = await Promise.all(connections.map(async (conn) => {
      const connObj = conn.toObject();
      if (conn.receiver && conn.receiver._id.toString() === req.user.id && conn.status === "pending") {
        const reviews = await Review.find({ teacher: conn.requester._id }).limit(3).populate("student", "name emoji");
        const skillFeedbacks = await SkillFeedback.find({ to: conn.requester._id }).limit(3).populate("from", "name emoji");
        let feedbacks = [...reviews, ...skillFeedbacks].slice(0, 3);
        
        if (feedbacks.length === 0) {
          // Use defaults if no real feedback exists
          feedbacks = getRandomFeedbacks(3);
        }
        connObj.requesterFeedbacks = feedbacks;
      }
      return connObj;
    }));

    res.json(connectionsWithFeedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/connections/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ error: "Connection not found" });
    
    // Only the receiver can accept/reject
    if (conn.receiver.toString() !== req.user.id) {
       return res.status(403).json({ error: "Unauthorized" });
    }

    if (status === "accepted") {
      // Logic for 2 to 3 feedbacks requirement
      const reviewCount = await Review.countDocuments({ teacher: conn.requester });
      const skillFeedbackCount = await SkillFeedback.countDocuments({ to: conn.requester });
      const totalFeedbacks = reviewCount + skillFeedbackCount;

      if (totalFeedbacks < 2) {
        return res.status(400).json({ 
          error: `Match has only ${totalFeedbacks} feedback(s). At least 2 feedbacks are required to accept this match.` 
        });
      }
    }

    conn.status = status;
    await conn.save();
    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/videos/:id", authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Only the uploader can delete their video
    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile Data
app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio, emoji, teach, learn, careerGoal } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { name, bio, emoji, teach, learn, careerGoal }, 
      { new: true, select: "-password" } // don't return password
    );
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: "Server error saving profile" });
  }
});

// Get ALL Users (for Browse section, excluding current user if passed query param?)
app.get("/users", async (req, res) => {
  try {
    // Return all users for now, stripped of passwords
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ error: "Server error fetching users" });
  }
});

// Advanced Match Users Logic (Career Goal or Direct Skill Matching)
app.get("/matches", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let requiredSkills = [];
    console.log(`[Matches] User: ${user.name}, Goal: "${user.careerGoal}"`);

    // 1. Check if user provided a career goal
    if (user.careerGoal && user.careerGoal.trim() !== "") {
      const goal = user.careerGoal.toLowerCase();
      
      // Static mapping as a fast fallback or alternative if OpenAI fails
      const staticMapping = {
        "web developer": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
        "data scientist": ["Python", "Machine Learning", "Data Analysis", "SQL", "Statistics"],
        "frontend developer": ["React", "JavaScript", "CSS", "TypeScript", "Figma"],
        "backend developer": ["Node.js", "Python", "SQL", "API Design", "Docker"],
        "ui/ux designer": ["Figma", "User Research", "Prototyping", "Design Systems", "UI Design"]
      };

      try {
        // Double check openai client exists
        if (!openai && process.env.OPENAI_API_KEY) {
           console.log("[Matches] Late-initializing OpenAI client...");
           // We can't easily re-declare global but we can use the constructor locally or a local var
        }

        if (!openai) throw new Error("API Key Missing");
        
        console.log(`[AI] Requesting skills for goal: ${user.careerGoal}`);
        const prompt = `List the top 5 core skills required for the career goal: "${user.careerGoal}". Return ONLY a comma-separated list of skills, nothing else.`;
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
          temperature: 0.2
        });
        
        const skillsText = response.choices[0].message.content.trim();
        requiredSkills = skillsText.split(",").map(skill => skill.replace(/[.!?]/g, "").trim());
        console.log(`[AI] Success! Found skills: ${requiredSkills.join(", ")}`);

      } catch (apiErr) {
        console.error("[Matches] OpenAI API Issue:", apiErr.message);
        // Fallback to static mapping if OpenAI fails but the goal matches one of our presets
        const matchedKey = Object.keys(staticMapping).find(k => goal.includes(k));
        if (matchedKey) {
          console.log(`[Matches] Using static fallback mapping for: ${matchedKey}`);
          requiredSkills = staticMapping[matchedKey];
        } else {
          console.log("[Matches] Fallback to manual learning list.");
          requiredSkills = user.learn.map(s => typeof s === 'string' ? s : (s.name || ""));
        }
      }
    } else {
      // Continue using existing logic
      requiredSkills = user.learn.map(s => typeof s === 'string' ? s : (s.name || ""));
    }

    if (!requiredSkills || requiredSkills.length === 0) {
      return res.json({ matches: [], requiredSkills: [] });
    }

    // 2. Search database for other users with these skills
    // We expect the users to be willing to teach at least one of these required skills.
    // teach array contains objects with name, e.g. {name: "React", proficiency: "Expert"} 
    // or plain strings depending on structure. We check both.
    const regexSkills = requiredSkills.map(skill => new RegExp('^' + skill + '$', 'i'));
    
    const escapedSkills = requiredSkills.map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const skillRegex = new RegExp(escapedSkills.join('|'), 'i');

    console.log(`[Matches] Searching with regex: ${skillRegex}`);

    // Find users (not me) offering to teach ANY of the requested skills
    const matches = await User.find({
      _id: { $ne: user._id },
      $or: [
        { "teach.name": { $regex: skillRegex } },
        { "teach": { $regex: skillRegex } },
        { "careerGoal": { $regex: skillRegex } } // Also match by goal if they set it
      ]
    }, "-password");
    
    console.log(`[Matches] Found ${matches.length} candidate matches in DB.`);

    // 3. Prioritize users with more matching skills and fetch feedbacks
    const sortedMatches = await Promise.all(matches.map(async (match) => {
      let matchCount = 0;
      match.teach.forEach(teachSkill => {
        const skillName = typeof teachSkill === 'string' ? teachSkill : teachSkill.name;
        if (skillName && requiredSkills.some(rs => rs.toLowerCase() === skillName.toLowerCase())) {
          matchCount++;
        }
      });

      // Fetch 2-3 feedbacks as requested
      const reviews = await Review.find({ teacher: match._id }).limit(3).populate("student", "name emoji");
      const skillFeedbacks = await SkillFeedback.find({ to: match._id }).limit(3).populate("from", "name emoji");
      let feedbacks = [...reviews, ...skillFeedbacks].slice(0, 3);

      if (feedbacks.length === 0) {
        // Inject high-quality defaults to make it look good
        feedbacks = getRandomFeedbacks(3);
      }

      return { ...match.toObject(), matchCount, feedbacks };
    }));

    const filteredMatches = sortedMatches.filter(m => m.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);

    res.json({ matches: filteredMatches, requiredSkills });
  } catch (err) {
    console.error("Match API Error:", err);
    res.status(500).json({ error: "Server error getting matches" });
  }
});

// --- RESOURCE ROUTES ---
app.post("/add-resource", authMiddleware, async (req, res) => {
  try {
    const { title, type, skill, url, pages, words } = req.body;
    if (!title || !skill || !url) {
      return res.status(400).json({ error: "Please provide title, skill and url" });
    }

    // Determine emoji based on type
    const emojis = { video: "🎥", pdf: "📄", notes: "📝" };
    const emoji = emojis[type] || "📄";

    const newResource = new Resource({
      title,
      type: type || "pdf",
      skill,
      url,
      uploadedBy: req.user.id,
      emoji,
      pages: pages || "",
      words: words || ""
    });

    await newResource.save();
    res.json({ message: "Resource shared successfully" });
  } catch (err) {
    console.error("Add Resource Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/resources", authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    console.log(`[Resources] User ${req.user.id} fetching resources...`);

    // 1. Find all accepted connections for this user
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { receiver: req.user.id, status: "accepted" }
      ]
    });

    // 2. Extract IDs of people this user is connected with
    const connectedUserIds = connections.map(conn => 
      conn.requester.toString() === req.user.id ? conn.receiver.toString() : conn.requester.toString()
    );

    // Also include the user's own resources
    connectedUserIds.push(req.user.id);

    // 3. Filter resources by these IDs
    let query = { uploadedBy: { $in: connectedUserIds } };
    if (type && type !== "All") {
      query.type = type.toLowerCase();
    }

    const resources = await Resource.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });
    
    const formattedResources = resources.map(r => ({
      id: r._id,
      title: r.title,
      type: r.type,
      skill: r.skill,
      url: r.url,
      by: r.uploadedBy.name,
      emoji: r.emoji,
      pages: r.pages,
      words: r.words,
      duration: r.duration
    }));

    res.json(formattedResources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/resources/:id", authMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    if (resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SESSION / BOOKING ROUTES ---
app.post("/book-session", authMiddleware, async (req, res) => {
  try {
    const { teacherId, date, time, skill } = req.body;
    if (!teacherId || !date || !time) {
      return res.status(400).json({ error: "Please provide teacherId, date and time" });
    }

    // Check if slot already booked for this teacher
    const existing = await Session.findOne({ 
      teacher: teacherId, 
      date, 
      time, 
      status: { $in: ["booked", "confirmed"] } 
    });
    if (existing) return res.status(400).json({ error: "This slot is already booked" });

    const meetingId = require("crypto").randomBytes(8).toString("hex");
    const meetingLink = `http://localhost:5173/session/${meetingId}`; // Using localhost for dev, can be easily changed to skillswap.com later

    const newSession = new Session({
      teacher: teacherId,
      student: req.user.id,
      date,
      time,
      skill: skill || "General Doubt Clearing",
      meetingId,
      meetingLink,
      status: "booked"
    });

    await newSession.save();
    res.json({ message: "Session booked successfully!", session: newSession, meetingLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacher: req.user.id }, { student: req.user.id }],
      status: { $in: ["booked", "confirmed"] }
    })
    .populate("teacher student", "name emoji")
    .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoint for session details by meetingId
app.get("/session-details/:meetingId", async (req, res) => {
  try {
    const session = await Session.findOne({ meetingId: req.params.meetingId })
      .populate("teacher student", "name emoji bio teach");
    
    if (!session) return res.status(404).json({ error: "Session not found" });
    
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MESSAGING ROUTES ---
app.post("/messages", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text) return res.status(400).json({ error: "Receiver and text required" });

    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      text
    });

    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REAL-TIME SOCKET HANDLERS ---
const activeUsers = new Map(); // userID -> socketID

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit("user-status", { userId, online: true });
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("send-message", async (data) => {
    const { senderId, receiverId, text } = data;
    
    // Persist message to DB (optional based on user req, but good for persistence)
    try {
      const newMessage = new Message({ sender: senderId, receiver: receiverId, text });
      await newMessage.save();
      
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", {
          _id: newMessage._id,
          sender: senderId,
          receiver: receiverId,
          text,
          createdAt: newMessage.createdAt
        });
      }
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on("typing", (data) => {
    const { receiverId, typing } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", { userId: data.userId, typing });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit("user-status", { userId, online: false });
        console.log("User disconnected:", userId);
        break;
      }
    }
  });
});

app.get("/messages/:peerId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.peerId },
        { sender: req.params.peerId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RATING & FEEDBACK ROUTES ---
app.post("/rate-teacher", authMiddleware, async (req, res) => {
  try {
    const { teacherId, sessionId, rating, text } = req.body;
    if (!teacherId || !rating) return res.status(400).json({ error: "Teacher ID and rating required" });

    const newReview = new Review({
      teacher: teacherId,
      student: req.user.id,
      sessionId,
      rating,
      text
    });

    await newReview.save();

    // Recalculate average rating for the teacher
    const reviews = await Review.find({ teacher: teacherId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // Update Teacher Stats
    await User.findByIdAndUpdate(teacherId, {
      rating: parseFloat(avgRating.toFixed(1)),
      sessions: reviews.length // Increment total sessions taught
    });
    
    // Reward Teacher with Badges
    await checkBadges(teacherId);

    // Update Student Stats (increment attended sessions count)
    await User.findByIdAndUpdate(req.user.id, { $inc: { attendCount: 1 } });
    
    // Reward Student with Badges
    await checkBadges(req.user.id);

    res.json({ message: "Review submitted successfully, both users updated!", avgRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/reviews/:teacherId", async (req, res) => {
  try {
    const reviews = await Review.find({ teacher: req.params.teacherId })
      .populate("student", "name emoji")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Dashboard Stats for Logged-in User
app.get("/dashboard-stats", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Skill matches: count accepted connections
    const matchCount = await Connection.countDocuments({
      $or: [{ requester: req.user.id }, { receiver: req.user.id }],
      status: "accepted"
    });

    // 2. Derive sessions and rating from user profile
    const sessionsDone = user.sessions || 0;
    const rating = user.rating || 5.0;

    // 3. Progress: simple logic, e.g., 10% per session up to 100%, or based on goal
    let progress = Math.min(sessionsDone * 10, 100);
    if (progress === 0 && user.careerGoal) progress = 15; // Starting point if goal is set

    res.json({
      matchCount: matchCount.toString(),
      sessionsDone: sessionsDone.toString(),
      rating: rating.toFixed(1),
      progress: `${progress}%`,
      goal: user.careerGoal || "a new skill"
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

// Fetch Current Logged-in User Profile
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- PROGRESS & SKILL FEEDBACK ---

// Mark video as completed
app.post("/video-complete", authMiddleware, async (req, res) => {
  try {
    const { videoId, skill } = req.body;
    if (!videoId || !skill) return res.status(400).json({ error: "videoId and skill are required" });

    // Check if already exist
    let prog = await Progress.findOne({ user: req.user.id, videoId });
    if (prog) {
      return res.json({ message: "Already completed", progress: prog });
    }

    prog = new Progress({ user: req.user.id, videoId, skill });
    await prog.save();
    res.json({ message: "Video marked as completed", progress: prog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get progress for a skill
app.get("/skill-progress/:skillName", authMiddleware, async (req, res) => {
  try {
    const skill = req.params.skillName;
    const totalVideos = await Video.countDocuments({ skill });
    const completedVideos = await Progress.find({ user: req.user.id, skill }).select("videoId");
    
    const count = completedVideos.length;
    const isCompleted = totalVideos > 0 && count === totalVideos;

    res.json({
      totalVideos,
      completedCount: count,
      completedVideoIds: completedVideos.map(p => p.videoId),
      isCourseCompleted: isCompleted,
      percent: totalVideos > 0 ? Math.round((count / totalVideos) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit skill feedback
app.post("/skill-feedback", authMiddleware, async (req, res) => {
  try {
    const { skill, toUserId, rating, text } = req.body;
    if (!skill || !toUserId || !rating) return res.status(400).json({ error: "Missing required fields" });

    // Check for duplicate
    const existing = await SkillFeedback.findOne({ skill, from: req.user.id });
    if (existing) return res.status(400).json({ error: "You have already provided feedback for this skill" });

    // Verify completion
    const totalVideos = await Video.countDocuments({ skill });
    const completedCount = await Progress.countDocuments({ user: req.user.id, skill });
    if (totalVideos === 0 || completedCount < totalVideos) {
      return res.status(403).json({ error: "Complete all videos in this skill before leaving feedback" });
    }

    const feedback = new SkillFeedback({
      skill, from: req.user.id, to: toUserId, rating, text
    });
    await feedback.save();

    // Update teacher's overall rating (optional but good)
    const allFeedbacks = await SkillFeedback.find({ to: toUserId });
    const avg = allFeedbacks.reduce((acc, f) => acc + f.rating, 0) / allFeedbacks.length;
    await User.findByIdAndUpdate(toUserId, { rating: avg });

    res.json({ message: "Feedback submitted successfully!", feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Server is running", database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});