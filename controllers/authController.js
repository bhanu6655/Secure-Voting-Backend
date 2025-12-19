const bcrypt = require("bcryptjs");
const db = require("../db/db");
const generateToken = require("../utils/jwt");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO voters (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashed],
    function (err) {
      if (err) {
        return res.status(400).json({ message: "User already exists" });
      }
      res.json({ message: "Voter registered successfully" });
    }
  );
};

const login = (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM voters WHERE email = ?`,
    [email],
    async (err, user) => {
      if (!user) {
        return res.status(400).json({ message: "Invalid user" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }

      const token = generateToken({ voter_id: user.voter_id });
      res.json({ token });
    }
  );
};

module.exports = { register, login }; // 🔴 REQUIRED
