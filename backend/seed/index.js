import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME } from "../src/config.js";
import { fetchPrice } from "./fetchPrice.js";
import { fetchDetails } from "./fetchDetails.js";

async function seed() {
  const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });

  const games = ["NBA 2K25", "Red Dead Redemption 2", "Split Fiction", "Cyberpunk 2077", "The Witcher 3: Wild Hunt", "Elden Ring", "Hades", "God of War", "Horizon Zero Dawn", "Mortal Combat 11","Assassin's Creed Valhalla", "Call of Duty Modern Warfare"];
  const createSql = `
    CREATE TABLE IF NOT EXISTS games (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      poster VARCHAR(1024),
      stores JSON DEFAULT NULL,
      platform VARCHAR(255),
      activation_region VARCHAR(255),
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      base_currency VARCHAR(8) DEFAULT 'EUR',
      cashback_sum DECIMAL(10,2) DEFAULT 0,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_name (name),
      FULLTEXT KEY ft_name_platform (name, platform)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const slugOverrides = {
    "NBA 2K25": "nba-2k25",
    "Red Dead Redemption 2": "red-dead-redemption-2",
  };

  try {
    await pool.query(createSql);

    for (const name of games) {
      console.log(`Fetching data for ${name}...`);

      let details = null;
      try {
        const slug = slugOverrides[name] || null;
        if (slug) console.log('Passing slug override for', name, '→', slug);
        details = await fetchDetails(name, slug);
        if (details && details.slug) console.log('Resolved RAWG slug for', name, '→', details.slug, '(', details?.name || 'no-name', ')');
      } catch (e) {
        console.warn('fetchDetails failed for', name, e.message || e);
      }

      let price = { price: 0, currency: 'EUR' };
      try {
        price = await fetchPrice(name);
      } catch (e) {
        console.warn('fetchPrice failed for', name, e.message || e);
      }

      const poster = details?.poster || null;
      const platform = details?.platforms || 'Unknown';
      const finalPrice = typeof price.price === 'number' ? price.price : 0;
      const finalCurrency = price.currency || 'EUR';
      const storesJson = (Array.isArray(price.stores) && price.stores.length > 0) ? JSON.stringify(price.stores) : null;

      try {
        await pool.query(
          `INSERT INTO games (name, poster, stores, platform, activation_region, price, base_currency, cashback_sum, likes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE poster=VALUES(poster), stores=VALUES(stores), price=VALUES(price), base_currency=VALUES(base_currency)`,
          [name, poster, storesJson, platform, 'Global', finalPrice, finalCurrency, 0, 0]
        );
        console.log(`Seeded ${name} — ${finalPrice} ${finalCurrency}`);
      } catch (e) {
        console.error('Insert failed for', name, e.message || e);
      }
    }
  } catch (err) {
    console.error('Seeding failed', err);
  } finally {
    await pool.end();
  }
}

seed();
