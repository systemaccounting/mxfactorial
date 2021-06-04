import { Client } from 'pg';
import type { db } from '../index.d';

const client = new Client({
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	port: parseInt(process.env.PGPORT),
	connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT),
});

async function connect() {
	return client.connect();
};

async function query(text: string, params: string[]) {
	return client.query(text, params);
};

async function end() {
	if (process.env.PG_DISCONNECT) {
		return client.end();
	};
};

const pg: db = {
	connect,
	query,
	end,
}

export default pg;