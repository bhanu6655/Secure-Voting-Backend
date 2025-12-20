require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.json());


// AUTH MIDDLEWARE

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization missing" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// admin 

const authenticateAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access only" });
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


// VOTER AUTH

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO voters (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashed],
    (err) => {
      if (err)
        return res.status(400).json({ message: "Voter already exists" });
      res.json({ message: "Voter registered" });
    }
  );
});


app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM voters WHERE email = ?`,
    [email],
    async (err, voter) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!voter)
        return res.status(400).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, voter.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { voter_id: voter.voter_id, role: "voter" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});


// CANDIDATE AUTH

app.post("/candidates/register", async (req, res) => {
  const { name, email, party, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO candidates (name, email, party, password)
     VALUES (?, ?, ?, ?)`,
    [name, email, party, hashed],
    (err) => {
      if (err)
        return res.status(400).json({ message: "Candidate already exists" });
      res.json({ message: "Candidate registered" });
    }
  );
});

app.post("/candidates/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM candidates WHERE email = ?`,
    [email],
    async (err, candidate) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!candidate)
        return res.status(400).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, candidate.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { candidate_id: candidate.candidate_id, role: "candidate" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});


// VOTING (SAFE & ATOMIC)

app.post("/vote/:candidateId", authenticate, (req, res) => {
  if (req.user.role !== "voter") {
    return res.status(403).json({ message: "Only voters can vote" });
  }

  const voterId = req.user.voter_id;
  const candidateId = req.params.candidateId;


  db.get(
    "SELECT * FROM votes WHERE voter_id = ?",
    [voterId],
    (err, vote) => {
      if (vote) {
        return res.status(400).json({ message: "You already voted" });
      }

      db.run(
        "INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)",
        [voterId, candidateId],
        () => {
          
          db.run(
            "UPDATE candidates SET votes = votes + 1 WHERE candidate_id = ?",
            [candidateId]
          );

          res.json({ message: "Vote cast successfully" });
        }
      );
    }
  );
});


// VIEW CANDIDATES (VOTERS ONLY)

app.get("/candidates", authenticate, (req, res) => {
  if (req.user.role !== "voter")
    return res.status(403).json({ message: "Only voters allowed" });

  db.all(
    `SELECT candidate_id, name, party, votes FROM candidates`,
    [],
    (err, rows) => {
      res.json(rows);
    }
  );
});


// CANDIDATE VIEW OWN VOTES

app.get(
  "/candidates/me/votes",
  authenticateCandidate,
  (req, res) => {
    const candidateId = req.user.candidate_id;

    db.get(
      `SELECT candidate_id, name, party, votes
       FROM candidates
       WHERE candidate_id = ?`,
      [candidateId],
      (err, candidate) => {
        res.json(candidate);
      }
    );
  }
);


<<<<<<< HEAD
app.get("/admin/votes", authenticateAdmin, (req, res) => {
  db.all(
    `
    SELECT
      voters.name AS voter,
      candidates.name AS candidate
    FROM votes
    JOIN voters ON votes.voter_id = voters.voter_id
    JOIN candidates ON votes.candidate_id = candidates.candidate_id
    `,
    [],
    (err, rows) => res.json(rows)
  );
});



=======
// SERVER START
>>>>>>> 26179abc58595151b8186a2745c7ed89939104a6

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
