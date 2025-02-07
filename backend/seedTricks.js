const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// Set up the PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Function to populate both the tricks and user_tricks tables
const seedTricks = async () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "tricks.json"), "utf8");
    const tricks = JSON.parse(data);

    // Get a list of users from the users table
    const usersResult = await pool.query("SELECT id FROM users");
    const users = usersResult.rows;

    if (users.length === 0) {
      console.log("No users found in the database.");
      return;
    }

    for (const trick of tricks) {
      const { trick_name, difficulty, description } = trick;

      // Check if the trick already exists in the tricks table
      const existingTrickResult = await pool.query(
        `SELECT id FROM tricks WHERE name = $1`,
        [trick_name]
      );

      let trickId;
      if (existingTrickResult.rows.length === 0) {
        // Trick does not exist, insert it
        const trickInsertResult = await pool.query(
          `INSERT INTO tricks (name, difficulty, description) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [trick_name, difficulty, description]
        );
        trickId = trickInsertResult.rows[0].id;
        console.log(`Inserted new trick: ${trick_name} with ID: ${trickId}`);
      } else {
        // Trick already exists, use the existing trick ID
        trickId = existingTrickResult.rows[0].id;
        console.log(`Trick '${trick_name}' already exists with ID: ${trickId}`);
      }

      // Insert the trick into the user_tricks table, ensuring max 5 tricks per user
      for (const user of users) {
        // Check how many tricks the user already has
        const userTrickCountResult = await pool.query(
          `SELECT COUNT(*) FROM user_tricks WHERE user_id = $1`,
          [user.id]
        );
        const userTrickCount = parseInt(userTrickCountResult.rows[0].count, 10);

        if (userTrickCount < 5) {
          try {
            await pool.query(
              `INSERT INTO user_tricks (user_id, trick_id) 
               VALUES ($1, $2) 
               ON CONFLICT (user_id, trick_id) DO NOTHING`,
              [user.id, trickId]
            );
            console.log(
              `Inserted trick ${trick_name} (ID: ${trickId}) for user ID ${user.id}`
            );
          } catch (err) {
            console.error(
              `Error inserting trick ${trick_name} for user ID ${user.id}:`,
              err
            );
          }
        } else {
          console.log(
            `User ID ${user.id} already has 5 tricks. Skipping trick ${trick_name}.`
          );
        }
      }
    }

    console.log("Trick seeding complete!");
  } catch (err) {
    console.error("Error populating tricks and user_tricks:", err);
  } finally {
    pool.end(); // Close the database connection
  }
};

// Run the function to populate the tables
seedTricks();
