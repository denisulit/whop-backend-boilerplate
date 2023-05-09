import { Pool } from "pg";

const credentials = {
    connectionString: process.env.CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
};

// Query with a connection pool.
const pool = new Pool(credentials);
async function connectPool() {
    await pool.connect();
};
connectPool();

export { pool };
