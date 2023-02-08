import baseConfig from './playwright.base.config.ts';

const config: PlaywrightTestConfig = {
	...baseConfig,
	globalSetup: './tests/global-setup',
	globalTeardown: './tests/global-teardown.ts'
};

export default config;