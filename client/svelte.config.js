import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		csrf: {
			trustedOrigins: ['*']
		}
	},

	onwarn: (warning, handler) => {
		if (warning.code === 'a11y-click-events-have-key-events') return;
		handler(warning)
	}
};

export default config;
