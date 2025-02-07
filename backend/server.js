require("dotenv").config(); // Load environment variables
const express = require("express");
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For JWT token
const { Pool } = require("pg"); // PostgreSQL client

// Initialize Express app
const app = express();

// PostgreSQL pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Middleware to parse incoming JSON requests
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

app.post("/addTrick", authenticate, async (req, res) => {
  const { trick_name, difficulty, description } = req.body;

  if (!trick_name) {
    return res.status(400).json({ error: "Trick name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO user_tricks (user_id, trick_name, difficulty, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.userId, trick_name, difficulty, description]
    );

    res
      .status(201)
      .json({ message: "Trick added successfully", trick: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/myTricks", authenticate, async (req, res) => {
  try {
    // Query to get all trick details by joining user_tricks and tricks tables
    const result = await pool.query(
      "SELECT t.id, t.name, t.description, t.difficulty " + // Removed extra comma here
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

// Start the server
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
