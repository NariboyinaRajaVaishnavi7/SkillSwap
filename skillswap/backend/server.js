require("dotenv").config();
// Fix Node.js DNS issues with MongoDB SRV records on certain local networks
require("dns").setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OpenAI } = require("openai");

// Initialize OpenAI conditionally so the server doesn't crash on startup if the key is missing
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000 // 10 second timeout to prevent hanging
    })
  : null;

// JWT Secret (In production, move this to .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_for_skillswap";

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
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

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
      user: { id: newUser._id, name: newUser.name, email: newUser.email, emoji: newUser.emoji } 
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
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
      user: { id: user._id, name: user.name, email: user.email, emoji: user.emoji, bio: user.bio, teach: user.teach, learn: user.learn } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
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
    
    // Find users (not me) offering to teach ANY of the requested skills
    const matches = await User.find({
      _id: { $ne: user._id },
      $or: [
        { "teach.name": { $in: regexSkills } },
        { "teach": { $in: regexSkills } }
      ]
    }, "-password");

    // 3. Prioritize users with more matching skills
    const sortedMatches = matches.map(match => {
      let matchCount = 0;
      match.teach.forEach(teachSkill => {
        const skillName = typeof teachSkill === 'string' ? teachSkill : teachSkill.name;
        if (skillName && requiredSkills.some(rs => rs.toLowerCase() === skillName.toLowerCase())) {
          matchCount++;
        }
      });
      return { ...match.toObject(), matchCount };
    }).filter(m => m.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);

    res.json({ matches: sortedMatches, requiredSkills });
  } catch (err) {
    console.error("Match API Error:", err);
    res.status(500).json({ error: "Server error getting matches" });
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));