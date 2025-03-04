import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite'
import dotenv from 'dotenv';

const { parsed: vars = {} } = dotenv.config();
const port = vars.CLIENT_PORT ? parseInt(vars.CLIENT_PORT) : undefined;

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		port
	}
});