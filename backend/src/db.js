import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'localdev',
  password: process.env.DB_PASS || 'Localdev123!',
  database: process.env.DB_NAME || 'enebahw_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
