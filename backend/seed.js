const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const dropTables = async () => {
  const dropTablesQuery = `
    DROP TABLE IF EXISTS user_rewards CASCADE;
    DROP TABLE IF EXISTS user_tricks CASCADE;
    DROP TABLE IF EXISTS user_profiles CASCADE;
    DROP TABLE IF EXISTS challenges CASCADE;
    DROP TABLE IF EXISTS tricks CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `;

  try {
    await pool.query(dropTablesQuery);
    console.log("All tables dropped.");
  } catch (err) {
    console.error("Error dropping tables:", err);
    process.exit(1);
  }
};

// SQL schema creation
const createTables = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    bio TEXT,
    age INT,
    location VARCHAR(255),
    stance VARCHAR(255) CHECK (stance IN ('goofy', 'regular')), -- Stance field with a check constraint
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


    CREATE TABLE IF NOT EXISTS tricks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        difficulty VARCHAR(50),
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS user_tricks (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        trick_id INT REFERENCES tricks(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'learning',
        CONSTRAINT unique_user_trick UNIQUE (user_id, trick_id)
    );

    CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        difficulty VARCHAR(50),
        reward_points INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_rewards (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INT REFERENCES challenges(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points_earned INT DEFAULT 0,
        CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
    );
  `;

  try {
    await pool.query(createTablesQuery);
    console.log("Tables created or already exist.");
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
};

// Seed at least one user
const seedUsers = async () => {
  try {
    const existingUsers = await pool.query("SELECT id FROM users");
    if (existingUsers.rows.length === 0) {
      const defaultUser = await pool.query(
        `INSERT INTO users (username, email, password) 
         VALUES ('ajseadler', 'aj@a.com', 'password1234') 
         RETURNING id`
      );
      console.log(`Inserted default user with ID: ${defaultUser.rows[0].id}`);
    } else {
      console.log("At least one user already exists.");
    }
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

const seedUserProfiles = async () => {
  try {
    const users = await pool.query("SELECT id FROM users");

    const defaultAvatarUrl = "assets/images/profile.png"; // Replace with your default avatar image URL

    for (const user of users.rows) {
      await pool.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, bio, age, location, stance, profile_picture)
         VALUES ($1, 'AJ', 'Seadler', 'Cybersecurity & Web Dev enthusiast.', 25, 'Oklahoma City, OK', NULL, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, defaultAvatarUrl] // Only user ID and profile picture are required here
      );

      console.log(`Inserted profile for user ID ${user.id}`);
    }
  } catch (err) {
    console.error("Error seeding user profiles:", err);
  }
};

// Seed tricks and user_tricks
const seedTricks = async () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "tricks.json"), "utf8");
    const tricks = JSON.parse(data);

    const usersResult = await pool.query("SELECT id FROM users");
    const users = usersResult.rows;

    if (users.length === 0) {
      console.log("No users found. Skipping trick seeding.");
      return;
    }

    await pool.query("DELETE FROM user_tricks");

    for (const trick of tricks) {
      const { trick_name, difficulty, description } = trick;

      const existingTrickResult = await pool.query(
        `SELECT id FROM tricks WHERE name = $1`,
        [trick_name]
      );

      let trickId;
      if (existingTrickResult.rows.length === 0) {
        const trickInsertResult = await pool.query(
          `INSERT INTO tricks (name, difficulty, description) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [trick_name, difficulty, description]
        );
        trickId = trickInsertResult.rows[0].id;
        console.log(`Inserted new trick: ${trick_name} with ID: ${trickId}`);
      } else {
        trickId = existingTrickResult.rows[0].id;
        console.log(`Trick already exists: ${trick_name}`);
      }

      for (const user of users) {
        const userTrickCountResult = await pool.query(
          `SELECT COUNT(*) FROM user_tricks WHERE user_id = $1`,
          [user.id]
        );
        const userTrickCount = parseInt(userTrickCountResult.rows[0].count, 10);

        if (userTrickCount < 5) {
          await pool.query(
            `INSERT INTO user_tricks (user_id, trick_id, status) 
             VALUES ($1, $2, 'learning') 
             ON CONFLICT (user_id, trick_id) DO NOTHING`,
            [user.id, trickId]
          );
          console.log(
            `Inserted trick ${trick_name} (ID: ${trickId}) for user ID ${user.id}`
          );
        } else {
          console.log(`User ID ${user.id} already has 5 tricks. Skipping.`);
        }
      }
    }

    console.log("Trick seeding complete!");
  } catch (err) {
    console.error("Error seeding tricks:", err);
  }
};

// Seed challenges
const seedChallenges = async () => {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, "challenges.json"),
      "utf8"
    );
    const challenges = JSON.parse(data);

    for (const challenge of challenges) {
      const { name, description, difficulty, reward_points } = challenge;

      const existingChallengeResult = await pool.query(
        `SELECT id FROM challenges WHERE name = $1`,
        [name]
      );

      if (existingChallengeResult.rows.length === 0) {
        const challengeInsertResult = await pool.query(
          `INSERT INTO challenges (name, description, difficulty, reward_points) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          [name, description, difficulty, reward_points]
        );
        console.log(
          `Inserted challenge: ${name} with ID: ${challengeInsertResult.rows[0].id}`
        );
      } else {
        console.log(`Challenge already exists: ${name}`);
      }
    }

    console.log("Challenge seeding complete!");
  } catch (err) {
    console.error("Error seeding challenges:", err);
  }
};

// Seed user rewards (no pre-seeded rewards)
const seedUserRewards = async () => {
  try {
    const usersResult = await pool.query("SELECT id FROM users");
    const users = usersResult.rows;

    const challengesResult = await pool.query(
      "SELECT id, reward_points FROM challenges"
    );
    const challenges = challengesResult.rows;

    if (users.length === 0 || challenges.length === 0) {
      console.log("No users or challenges found. Skipping rewards seeding.");
      return;
    }

    // Clear the user_rewards table to prevent pre-seeded rewards
    await pool.query("DELETE FROM user_rewards");
    console.log("Cleared existing user rewards.");

    // Skipping the insertion of pre-seeded rewards as users will earn them dynamically
    console.log(
      "Skipping user rewards seeding. Users will earn rewards through challenges."
    );
  } catch (err) {
    console.error("Error seeding user rewards:", err);
  }
};

// Run all seeding functions
const seedDatabase = async () => {
  await dropTables();
  await createTables();
  await seedUsers();
  await seedUserProfiles();
  await seedTricks();
  await seedChallenges();
  await seedUserRewards();
  pool.end();
};

// Execute seeding
seedDatabase();
