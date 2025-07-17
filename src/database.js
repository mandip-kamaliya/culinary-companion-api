import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
        user:process.env.PG_USER,
        host:process.env.PG_HOST,
        database:process.env.PG_DATABASE,
        password:process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT || '5432', 10),
});

async function initializeDatabaseSchema(){
    let client;

 try {
       client = await pool.connect();
       console.log("connection successfully!!!");

     await  client.query(`
         CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ingredients JSONB NOT NULL,
        instructions TEXT NOT NULL
      );
        `)
        console.log("schema inialize successfully");
 } catch (error) {
    console.error(error);
    process.exit(1);
 }
}
initializeDatabaseSchema()
  .then(() => console.log('PostgreSQL database initialization routine completed.'))
  .catch((err) => console.error('PostgreSQL database initialization failed after attempt:', err));

export default pool;


