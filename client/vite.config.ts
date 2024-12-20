import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite'
import dotenv from 'dotenv';

const { parsed: vars = {} } = dotenv.config();

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env': {
			...vars
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		port: vars.CLIENT_PORT
	}
});
