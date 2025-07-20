import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// --- FIXED: Moved timestamp() to a higher scope ---
const timestamp = () => new Date().toLocaleTimeString(); // Now accessible throughout the module
// --- END FIXED ---

const pool = new Pool({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT || '5432', 10),
});

async function initializeDatabaseSchema(){
    let client; // This client is null
    // No need to redeclare timestamp here, it's already defined above

    try {
        console.log(`[${timestamp()}] Attempting to connect to PostgreSQL pool...`);
        client = await pool.connect();
        console.log(`[${timestamp()}] PostgreSQL connection successful! Client acquired.`);

        console.log(`[${timestamp()}] Executing CREATE TABLE for 'recipes'...`);
        await client.query(`
            CREATE TABLE IF NOT EXISTS recipes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                ingredients JSONB NOT NULL,
                instructions TEXT NOT NULL
            );
        `);
        console.log(`[${timestamp()}] 'recipes' table checked/created successfully!`);

        console.log(`[${timestamp()}] Executing CREATE TABLE for 'users'...`);
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(`[${timestamp()}] 'users' table checked/created successfully!`);

        console.log(`[${timestamp()}] Releasing PostgreSQL client.`);
        client.release();
        console.log(`[${timestamp()}] Client released. Database schema initialization complete.`);
    } catch (error) {
        console.error(`[${timestamp()}] --- CRITICAL ERROR during Database Initialization ---`);
        console.error(`[${timestamp()}] Error details:`, error);
        console.error(`[${timestamp()}] This caused the application to exit.`);
        process.exit(1);
    }
}

// Call the initialization function when this module is loaded
initializeDatabaseSchema()
  .then(() => console.log(`[${timestamp()}] PostgreSQL database initialization routine completed.`))
  .catch((err) => console.error(`[${timestamp()}] PostgreSQL database initialization failed after attempt:`, err));

export default pool;