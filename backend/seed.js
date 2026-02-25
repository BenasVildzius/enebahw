// backend/seed.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'localdev',
    password: process.env.DB_PASS || 'Localdev123!',
    database: process.env.DB_NAME || 'enebahw_db',
    waitForConnections: true,
    connectionLimit: 5,
  });

  const games = [
    ['FIFA 23','fifa-23','Multi',2022,'FIFA 23 is the 2022 football simulation game with updated teams and modes.','https://example.com/covers/fifa23.jpg'],
    ['Red Dead Redemption 2','rdr2','PS4;Xbox One;PC',2018,'Open-world western action-adventure from Rockstar Games.','https://example.com/covers/rdr2.jpg'],
    ['Split Fiction','split-fiction','PC',2021,'Indie narrative-driven puzzle game with branching timelines.','https://example.com/covers/splitfiction.jpg']
  ];

  const sql = `INSERT IGNORE INTO games (name, slug, platform, release_year, description, cover_url)
               VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    for (const g of games) {
      await pool.query(sql, g);
    }
    console.log('Seed complete');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

seed();
