import dotenv from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;
// Load environment variables
dotenv.config();
// Create a PostgreSQL client
const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
});
export default db;
