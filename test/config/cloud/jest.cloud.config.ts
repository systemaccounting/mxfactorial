import config from "../jest.base.config"

export default {
	...config,
	testMatch: [
		"**/?(*.)+(cloud|test|integ).[tj]s?(x)"
	],
	setupFilesAfterEnv: ['<rootDir>/afterEnv.ts'],
	testTimeout: 1000 * 60 * 30, // mins
	roots: ["../.."]
};
