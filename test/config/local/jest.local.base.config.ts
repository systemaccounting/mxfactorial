import config from "../jest.base.config"

export default {
	...config,
	testMatch: [
		"**/?(*.)+(docker|test|integ).[tj]s?(x)"
	],
	setupFilesAfterEnv: ['<rootDir>/afterEnv.ts'],
	roots: ["../.."]
};
