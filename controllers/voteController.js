const db = require("../db/db");

const getCandidates = (req, res) => {
  db.all(`SELECT * FROM candidates`, [], (err, rows) => {
    res.json(rows);
  });
};

const vote = (req, res) => {
  const voterId = req.voter.voter_id;
  const candidateId = req.params.id;

  db.get(
    `SELECT has_voted FROM voters WHERE voter_id = ?`,
    [voterId],
    (err, voter) => {
      if (voter.has_voted) {
        return res.status(400).json({ message: "Already voted" });
      }

      db.serialize(() => {
        db.run(
          `UPDATE candidates SET votes = votes + 1 WHERE candidate_id = ?`,
          [candidateId]
        );

        db.run(
          `UPDATE voters SET has_voted = 1 WHERE voter_id = ?`,
          [voterId]
        );

        res.json({ message: "Vote cast successfully" });
      });
    }
  );
};

module.exports = { getCandidates, vote };
