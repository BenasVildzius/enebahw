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
        'SELECT id, name, poster, stores, platform, activation_region, price, base_currency, cashback_sum, likes FROM games ORDER BY name LIMIT ?',
        [parseInt(limit || 100)]
      );
      // ensure JSON columns are parsed
      const parsed = rows.map(r => {
        try { if (r.stores && typeof r.stores === 'string') r.stores = JSON.parse(r.stores); } catch (e) { /* keep as-is */ }
        return r;
      });
      return res.json(parsed);
    }

    // If search provided, use FULLTEXT first, then fallback to LIKE
    const term = search.trim();

    // Prepare boolean-mode query for partial matches: add + for required words and * for prefix
    const booleanQuery = term.split(/\s+/).map(w => `+${w}*`).join(' ');

    // Fulltext search (on `name` only). If your DB doesn't have a fulltext index this
    // may return empty or be less effective — the fallback LIKE will still run.
    const ftSql = `SELECT id, name, poster, stores, platform, activation_region, price, base_currency, cashback_sum, likes,
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
      const parsed = ftRows.map(r => {
        try { if (r.stores && typeof r.stores === 'string') r.stores = JSON.parse(r.stores); } catch (e) {}
        return r;
      });
      return res.json(parsed);
    }

    // Fallback: LIKE fuzzy search across `name` and `platform`
    const likeTerm = `%${term}%`;
    const likeSql = `SELECT id, name, poster, stores, platform, activation_region, price, base_currency, cashback_sum, likes
         FROM games
         WHERE name LIKE ? OR platform LIKE ?
         ORDER BY name
         LIMIT ?`;
    const [likeRows] = await pool.query(likeSql, [likeTerm, likeTerm, parseInt(limit || 50)]);
    const parsed = likeRows.map(r => {
      try { if (r.stores && typeof r.stores === 'string') r.stores = JSON.parse(r.stores); } catch (e) {}
      return r;
    });
    if (parsed.length > 0) return res.json(parsed);

    // FINAL fallback: simple fuzzy token-overlap ranking (works without DB extensions)
    try {
      const [allRows] = await pool.query(`SELECT id, name, poster, stores, platform, activation_region, price, base_currency, cashback_sum, likes FROM games`);
      const normalize = (s) => (s || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
      const tokensOf = (s) => normalize(s).split(/\s+/).filter(Boolean);
      const termTokens = tokensOf(term);

      const scored = allRows.map(r => {
        const nameStr = `${r.name || ''} ${r.platform || ''}`;
        const nameTokens = tokensOf(nameStr);
        let intersection = 0;
        for (const nt of nameTokens) {
          for (const tt of termTokens) {
            if (nt === tt || nt.startsWith(tt) || tt.startsWith(nt) || nt.includes(tt) || tt.includes(nt)) {
              intersection += 1;
              break;
            }
          }
        }
        const unionSize = new Set([...nameTokens, ...termTokens]).size || 1;
        const score = intersection / unionSize;
        return { row: r, score };
      }).filter(x => x.score > 0);

      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, parseInt(limit || 50)).map(s => {
        try { if (s.row.stores && typeof s.row.stores === 'string') s.row.stores = JSON.parse(s.row.stores); } catch (e) {}
        return s.row;
      });
      return res.json(top);
    } catch (e) {
      // If fuzzy fallback fails, just return empty array
      console.error('Fuzzy search fallback failed', e);
      return res.json([]);
    }
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
