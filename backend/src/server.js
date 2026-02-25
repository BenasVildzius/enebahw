import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/list', async (req, res) => {
  const { search, limit } = req.query;
  try {
    if (!search) {
      const [rows] = await pool.query('SELECT id, name, slug, platform, release_year, description, cover_url FROM games ORDER BY name LIMIT ?', [parseInt(limit || 100)]);
      return res.json(rows);
    }

    // If search provided, use FULLTEXT first, then fallback to LIKE
    const term = search.trim();

    // Prepare boolean-mode query for partial matches: add + for required words and * for prefix
    const booleanQuery = term.split(/\s+/).map(w => `+${w}*`).join(' ');

    // Fulltext search
    const ftSql = `SELECT id, name, slug, platform, release_year, description, cover_url,
                   MATCH(name, description) AGAINST (? IN BOOLEAN MODE) AS score
                   FROM games
                   WHERE MATCH(name, description) AGAINST (? IN BOOLEAN MODE)
                   ORDER BY score DESC
                   LIMIT ?`;
    const [ftRows] = await pool.query(ftSql, [booleanQuery, booleanQuery, parseInt(limit || 50)]);

    if (ftRows.length > 0) {
      return res.json(ftRows);
    }

    // Fallback: LIKE fuzzy search across name and description
    const likeTerm = `%${term}%`;
    const likeSql = `SELECT id, name, slug, platform, release_year, description, cover_url
                     FROM games
                     WHERE name LIKE ? OR description LIKE ?
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
// Fallback for SPA routing
app.get(/.*/, (req, res) => { 
    res.sendFile(path.resolve(__dirname, 'index.html')); 
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
