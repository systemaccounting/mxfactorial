import { Pool } from 'pg';
import type { IPGPool } from '../index.d';

const pool = new Pool({
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	port: parseInt(process.env.PGPORT),
	max: parseInt(process.env.PG_MAX_CONNECTIONS),
	idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT),
	connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT),
});

async function connect() {
	return pool.connect();
};

async function end() {
	return pool.end();
};

const db: IPGPool = {
	connect,
	end,
}

export default db;