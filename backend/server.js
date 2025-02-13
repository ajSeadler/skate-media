require("dotenv").config(); // Load environment variables
const express = require("express");
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For JWT token
const { Pool } = require("pg"); // PostgreSQL client
const cors = require("cors");

// Initialize Express app
const app = express();
const corsOptions = {
  origin: "http://localhost:8081", // Adjust this based on your frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

// PostgreSQL pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Middleware to parse incoming JSON requests
app.use(cors(corsOptions));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Route to add a user
app.post("/addUser", async (req, res) => {
  const { username, email, password } = req.body;

  // Log to ensure the data is coming in correctly
  console.log("Received data:", req.body);

  // Basic validation: Ensure all fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "User added successfully",
      user: result.rows[0], // Return user data without the password
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Route to login and generate JWT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Ensure email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Query to find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Compare password with hashed password stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token (valid for 1 hour)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1w",
    });

    res.status(200).json({
      message: "Login successful",
      token, // Send token back to the client
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Middleware to verify JWT token and extract user data
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Assuming Bearer token

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.userId = decoded.userId; // Add userId to the request
    next(); // Proceed to the next middleware or route handler
  });
};

// Route to get the logged-in user's profile
app.get("/profile", authenticate, async (req, res) => {
  try {
    // Query the database to get the user's profile info
    const result = await pool.query(
      "SELECT username, email FROM users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/profile", async (req, res) => {
  try {
    const { first_name, last_name, age, bio, location } = req.body;

    // Get token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }

    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Use 'userId' instead of 'user_id'

    if (!userId) {
      return res.status(400).json({ error: "User ID is required from token." });
    }

    // Check if the profile exists for the userId
    const existingProfile = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      // Create a new profile
      await pool.query(
        "INSERT INTO user_profiles (user_id, first_name, last_name, age, bio, location) VALUES ($1, $2, $3, $4, $5, $6)",
        [userId, first_name, last_name, age, bio, location]
      );
      return res.status(201).json({ message: "Profile created!" });
    } else {
      // Update the existing profile
      await pool.query(
        "UPDATE user_profiles SET first_name = $2, last_name = $3, age = $4, bio = $5, location = $6 WHERE user_id = $1",
        [userId, first_name, last_name, age, bio, location]
      );
      return res.status(200).json({ message: "Profile updated!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Route to get the logged-in user's profile details
app.get("/userProfile", authenticate, async (req, res) => {
  try {
    // Get the userId from the decoded JWT token (passed by authenticate middleware)
    const userId = req.userId;

    // Query to fetch profile information from user_profiles table
    const result = await pool.query(
      "SELECT first_name, last_name, age, bio, location, profile_picture FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Send back the profile data
    res.status(200).json({
      message: "Profile fetched successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/addTrick", authenticate, async (req, res) => {
  const { trick_id } = req.body; // Only need trick_id

  console.log("req body", req.body);

  if (!trick_id) {
    return res.status(400).json({ error: "Trick ID is required" });
  }

  try {
    // Insert into user_tricks table
    const result = await pool.query(
      "INSERT INTO user_tricks (user_id, trick_id) VALUES ($1, $2) RETURNING *",
      [req.userId, trick_id]
    );

    res
      .status(201)
      .json({ message: "Trick added to user", trick: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding trick to user" });
  }
});

// Route to get all tricks
app.get("/tricks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tricks");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No tricks found" });
    }

    res.status(200).json({ tricks: result.rows });
  } catch (err) {
    console.error("Error fetching tricks:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/myTricks", authenticate, async (req, res) => {
  try {
    // Query to get all trick details by joining user_tricks and tricks tables
    const result = await pool.query(
      "SELECT t.id, t.name, t.description, t.difficulty, ut.status " + // Removed extra comma here
        "FROM user_tricks ut " +
        "JOIN tricks t ON ut.trick_id = t.id " + // Join with tricks table
        "WHERE ut.user_id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No tricks found for this user" });
    }

    res.status(200).json({ tricks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Route to get all challenges
app.get("/challenges", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM challenges");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No challenges found" });
    }

    res.status(200).json({ challenges: result.rows });
  } catch (err) {
    console.error("Error fetching challenges:", err);
    res.status(500).json({ error: err.message });
  }
});

// Then, your /updateTrickStatus route
app.put("/updateTrickStatus", authenticate, async (req, res) => {
  const { trick_id, status } = req.body;

  if (!trick_id || status !== "mastered") {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const result = await pool.query(
      "UPDATE user_tricks SET status = $1 WHERE user_id = $2 AND trick_id = $3 RETURNING *",
      [status, req.userId, trick_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trick not found for this user" });
    }

    // Call checkAndAwardChallenges after the status update

    res.status(200).json({
      message: "Trick status updated successfully",
      updatedTrick: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating trick status:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
