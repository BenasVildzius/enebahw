import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
app.use(cors());
app.use(express.json());

// `PORT` is imported from `backend/src/config.js` (loaded via dotenv)

app.get('/list', async (req, res) => {
  const { search, limit } = req.query;
  try {
    if (!search) {
      const [rows] = await pool.query(
        'SELECT id, name, poster, platform, activation_region, price, base_currency, cashback_sum, likes FROM games ORDER BY name LIMIT ?',
        [parseInt(limit || 100)]
      );
      return res.json(rows);
    }

    // If search provided, use FULLTEXT first, then fallback to LIKE
    const term = search.trim();

    // Prepare boolean-mode query for partial matches: add + for required words and * for prefix
    const booleanQuery = term.split(/\s+/).map(w => `+${w}*`).join(' ');

    // Fulltext search (on `name` only). If your DB doesn't have a fulltext index this
    // may return empty or be less effective — the fallback LIKE will still run.
    const ftSql = `SELECT id, name, poster, platform, activation_region, price, base_currency, cashback_sum, likes,
             MATCH(name, platform) AGAINST (? IN BOOLEAN MODE) AS score
             FROM games
             WHERE MATCH(name, platform) AGAINST (? IN BOOLEAN MODE)
             ORDER BY score DESC
             LIMIT ?`;
    let ftRows = [];
    try {
      const [_ftRows] = await pool.query(ftSql, [booleanQuery, booleanQuery, parseInt(limit || 50)]);
      ftRows = _ftRows;
    } catch (e) {
      // If fulltext search fails (no index or other DB issue), ignore and fall back to LIKE below
      ftRows = [];
    }

    if (ftRows.length > 0) {
      return res.json(ftRows);
    }

    // Fallback: LIKE fuzzy search across `name` and `platform`
    const likeTerm = `%${term}%`;
    const likeSql = `SELECT id, name, poster, platform, activation_region, price, base_currency, cashback_sum, likes
             FROM games
             WHERE name LIKE ? OR platform LIKE ?
             ORDER BY name
             LIMIT ?`;
    const [likeRows] = await pool.query(likeSql, [likeTerm, likeTerm, parseInt(limit || 50)]);
    return res.json(likeRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve frontend static files
app.use(express.static(distPath));
// Fallback for SPA routing: serve the bundled index.html from the frontend `dist` folder
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
