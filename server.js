require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.json());

/* =======================
   AUTH MIDDLEWARE
======================= */

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authenticateAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  });
};

const authenticateCandidate = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  });
};

/* =======================
   ADMIN AUTH
======================= */

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await db.get(
    "SELECT * FROM admins WHERE username = ?",
    [username]
  );

  if (!admin) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { admin_id: admin.admin_id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* =======================
   VOTER AUTH
======================= */

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.run(
      "INSERT INTO voters (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );
    res.json({ message: "Voter registered" });
  } catch {
    res.status(400).json({ message: "Voter already exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const voter = await db.get(
    "SELECT * FROM voters WHERE email = ?",
    [email]
  );

  if (!voter) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, voter.password);
  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { voter_id: voter.voter_id, role: "voter" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* =======================
   CANDIDATE AUTH
======================= */

app.post("/candidates/register", async (req, res) => {
  const { name, email, party, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.run(
      "INSERT INTO candidates (name, email, party, password) VALUES (?, ?, ?, ?)",
      [name, email, party, hashed]
    );
    res.json({ message: "Candidate registered" });
  } catch {
    res.status(400).json({ message: "Candidate already exists" });
  }
});

app.post("/candidates/login", async (req, res) => {
  const { email, password } = req.body;

  const candidate = await db.get(
    "SELECT * FROM candidates WHERE email = ?",
    [email]
  );

  if (!candidate) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, candidate.password);
  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { candidate_id: candidate.candidate_id, role: "candidate" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* =======================
   VOTING
======================= */

app.post("/vote/:candidateId", authenticate, async (req, res) => {
  if (req.user.role !== "voter") {
    return res.status(403).json({ message: "Only voters can vote" });
  }

  const voterId = req.user.voter_id;
  const candidateId = req.params.candidateId;

  const alreadyVoted = await db.get(
    "SELECT * FROM votes WHERE voter_id = ?",
    [voterId]
  );

  if (alreadyVoted) {
    return res.status(400).json({ message: "You already voted" });
  }

  await db.run(
    "INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)",
    [voterId, candidateId]
  );

  await db.run(
    "UPDATE candidates SET votes = votes + 1 WHERE candidate_id = ?",
    [candidateId]
  );

  res.json({ message: "Vote cast successfully" });
});

/* =======================
   VIEW CANDIDATES (VOTER)
======================= */

app.get("/candidates", authenticate, async (req, res) => {
  if (req.user.role !== "voter") {
    return res.status(403).json({ message: "Only voters allowed" });
  }

  const candidates = await db.all(
    "SELECT candidate_id, name, party, votes FROM candidates"
  );

  res.json(candidates);
});

/* =======================
   CANDIDATE VIEW OWN VOTES
======================= */

app.get("/candidates", authenticate, async (req, res) => {
  if (req.user.role !== "voter") {
    return res.status(403).json({ message: "Only voters allowed" });
  }

  const candidates = await db.all(`
    SELECT
      c.candidate_id,
      c.name,
      c.party,
      COUNT(v.vote_id) AS votes
    FROM candidates c
    LEFT JOIN votes v
      ON c.candidate_id = v.candidate_id
    GROUP BY c.candidate_id
  `);

  res.json(candidates);
});


/* =======================
   ADMIN VIEW ALL VOTES
======================= */

app.get("/admin/votes", authenticateAdmin, async (req, res) => {
  const votes = await db.all(`
    SELECT
      voters.name AS voter,
      candidates.name AS candidate
    FROM votes
    JOIN voters ON votes.voter_id = voters.voter_id
    JOIN candidates ON votes.candidate_id = candidates.candidate_id
  `);

  res.json(votes);
});

*/=============
   Total votes
==================*/
      
app.get("/votes/total", async (req, res) => {
  const result = await db.get(
    "SELECT COUNT(*) AS totalVotes FROM votes"
  );

  res.json({ totalVotes: result.totalVotes });
});

/* =======================
   SERVER
======================= */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
