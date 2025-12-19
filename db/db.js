const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("db/votingApp.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Database connected successfully");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS voters (
      voter_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      has_voted INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      party TEXT NOT NULL,
      votes INTEGER DEFAULT 0
    )
  `);

  console.log("Voters and Candidates tables created successfully");
});


module.exports = db;
