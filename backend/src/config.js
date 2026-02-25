import dotenv from 'dotenv';
dotenv.config();

export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
export const RAWG_KEY = process.env.RAWG_KEY;

export default {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  PORT,
  RAWG_KEY,
};
