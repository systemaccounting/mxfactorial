const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  max: process.env.PG_MAX_CONNECTIONS,
  idleTimeoutMillis: process.env.PG_IDLE_TIMEOUT,
  connectionTimeoutMillis: process.env.PG_CONN_TIMEOUT,
});

// https://node-postgres.com/guides/project-structure
module.exports = {
  async query(text, params) {
    const res = await pool.query(text, params);
    return res;
  },
  async getClient() {
    const client = await pool.connect();
    return client;
  },
};