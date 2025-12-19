require("dotenv").config();
const express = require("express");


require("./db/db"); // ONLY ONCE

const authRoutes = require("./routes/authRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/vote", voteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
