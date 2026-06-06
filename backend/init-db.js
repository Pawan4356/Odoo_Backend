const fs = require("fs");
const path = require("path");
const db = require("./src/lib/db");

async function initializeDB() {
  try {
    const sqlFilePath = path.join(__dirname, "queries.sql");
    const sqlCommands =
      "DROP SCHEMA public CASCADE; CREATE SCHEMA public; " +
      fs.readFileSync(sqlFilePath, "utf8");
    console.log(
      "Executing SQL queries to initialize the database (Target: " +
        process.env.DB_DATABASE +
        ")...",
    );
    await db.query(sqlCommands);
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing the database:", error.message);
  } finally {
    process.exit();
  }
}

initializeDB();
