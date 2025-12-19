const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const { getCandidates, vote } = require("../controllers/voteController");

const router = express.Router();

router.get("/candidates", authenticate, getCandidates);
router.post("/vote/:id", authenticate, vote);

module.exports = router;
