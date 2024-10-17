import dotenv from 'dotenv';
import { Client } from 'pg';



// Load environment variables
dotenv.config();
// Create a PostgreSQL client
const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 3001
  });
  

  
 

export default db;