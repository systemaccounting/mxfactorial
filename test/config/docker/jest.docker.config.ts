import config from "./jest.docker.base.config"

export default {
	...config,
	globalSetup: "<rootDir>/setup.ts",
	globalTeardown: "<rootDir>/teardown.ts",
};
