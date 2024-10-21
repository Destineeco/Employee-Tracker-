import pkg from 'pg';
import dotenv from 'dotenv';
const { Client } = pkg;
// Load environment variables from .env file
dotenv.config();
// Create a new PostgreSQL client
const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
// Connect to the database
const connectDb = async () => {
    try {
        await client.connect();
        console.log('Connected to the database successfully.');
    }
    catch (error) {
        console.error('Database connection error:', error);
    }
    return connectDb;
};
// Export the client and connectDb function
export { client, connectDb };
