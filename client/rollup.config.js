import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import builtins from 'rollup-plugin-node-builtins';

import dotenv from 'dotenv';

dotenv.config();

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
		// globals: {},

	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance

		css({ output: 'bundle.css' }),
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			preferBuiltins: false,
			dedupe: ['svelte'],
		}),
		commonjs(),
		builtins(),
		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
		json(),
		replace({
			"process.env.NODE_ENV": JSON.stringify("production"),
            "process.env.GRAPHQL_URI": JSON.stringify(process.env.GRAPHQL_URI),
            "process.env.POOL_ID": JSON.stringify(process.env.POOL_ID),
            "process.env.CLIENT_ID": JSON.stringify(process.env.CLIENT_ID),
            "process.env.NO_AUTH": JSON.stringify(process.env.NO_AUTH),
			preventAssignment: true,
		}),
	],
	watch: {
		clearScreen: false
	}
};
