const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());

const pool = mysql.createPool({
  host: "localhost",
  user: "gameuser",
  password: "StrongPassword123!",
  database: "gamesdb"
});

app.get("/list", async (req, res) => {
  const search = req.query.search;
  let query = "SELECT * FROM games";
  let params = [];

  if (search) {
    query += " WHERE title LIKE ?";
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(query, params);
  res.json(rows);
});

app.listen(3001, () => console.log("Backend running on port 3001"));
