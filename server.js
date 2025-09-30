import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------- MySQL Setup -----------------
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "entryuser",
  password: "EntryPass123",
  database: "entry"
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected...");

  const createTable = `
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      score INT NOT NULL
    )
  `;
  db.query(createTable, (err) => {
    if (err) console.error("❌ Error creating table:", err);
    else console.log("✅ Leaderboard table ready.");
  });
});

// ----------------- Helper -----------------
function trimLeaderboard() {
  // Houd alleen de top 50 scores
  const query = `
    DELETE FROM leaderboard
    WHERE id NOT IN (
      SELECT id FROM (
        SELECT id FROM leaderboard
        ORDER BY score DESC
        LIMIT 50
      ) AS top50
    )
  `;
  db.query(query, (err) => {
    if (err) console.error("❌ Error trimming leaderboard:", err);
  });
}

// ----------------- Routes -----------------

// Save or update score
app.post("/saveScore", (req, res) => {
  const { username, score } = req.body;
  if (!username || score == null) return res.status(400).send("Username and score required");

  db.query("SELECT score FROM leaderboard WHERE username = ?", [username], (err, results) => {
    if (err) return res.status(500).send("Database error");

    if (results.length > 0) {
      if (score > results[0].score) {
        db.query("UPDATE leaderboard SET score = ? WHERE username = ?", [score, username], (err) => {
          if (err) return res.status(500).send("Database error");
          trimLeaderboard();
          res.send("Score updated!");
        });
      } else {
        res.send("Score not higher, no update.");
      }
    } else {
      db.query("INSERT INTO leaderboard (username, score) VALUES (?, ?)", [username, score], (err) => {
        if (err) return res.status(500).send("Database error");
        trimLeaderboard();
        res.send("Score saved!");
      });
    }
  });
});

// Get top 50 scores
app.get("/leaderboard", (req, res) => {
  db.query("SELECT username, score FROM leaderboard ORDER BY score DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ----------------- Start Server -----------------
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
