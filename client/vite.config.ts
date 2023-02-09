import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import dotenv from 'dotenv';

const { parsed: vars } = dotenv.config()

const config: UserConfig = {
	plugins: [sveltekit()],
	define: {
		process :{
			env: { ...vars }
		}
	},
	optimizeDeps: {
		exclude: ['@urql/svelte'],
	  }
};

export default config;
