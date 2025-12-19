const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register); // register MUST be a function
router.post("/login", login);

module.exports = router;
