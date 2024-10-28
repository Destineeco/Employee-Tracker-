import fs from 'fs';
import path from 'path';
import { pool, connectToDb } from './connection.js';
// Function to initialize the database schema
async function initDb() {
    const schemaPath = path.join('db', 'schema.sql');
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema); // Use the exported pool to execute the schema SQL
        console.log('Database schema initialized successfully.');
    } catch (error) {
        console.error('Error initializing database schema:', error);
    }
}