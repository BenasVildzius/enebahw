import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } from './config.js';

const useSsl = process.env.DB_SSL === 'true' || false;
let sslOption;
if (useSsl) {
  // `DB_CA` should contain the PEM contents (single-line or multiline).
  // mysql2 accepts a string for ssl.ca
  const ca = process.env.DB_CA || '';
  sslOption = { ca };
} else {
  sslOption = undefined;
}

export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? parseInt(DB_PORT, 10) : undefined,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslOption,
});
