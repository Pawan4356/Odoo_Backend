const db = require("./src/lib/db");

async function run() {
  try {
    await db.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'Active';");
    console.log("Column added successfully.");
  } catch (err) {
    if (err.message.includes("already exists")) {
      console.log("Column already exists.");
    } else {
      console.error(err);
    }
  } finally {
    process.exit(0);
  }
}

run();
