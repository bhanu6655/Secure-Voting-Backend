const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./votingApp.db", (err) => {
  if (err) {
    console.error("DB connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS voters (
      voter_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      has_voted INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      party TEXT,
      password TEXT,
      votes INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
      voter_id INTEGER UNIQUE,
      candidate_id INTEGER,
      FOREIGN KEY (voter_id) REFERENCES voters(voter_id),
      FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
    )
  `);
});

module.exports = db;
