export default {
	preset: "ts-jest",
	testEnvironment: "node",
	coverageDirectory: "./coverage",
	coveragePathIgnorePatterns: ["node_modules"],
	reporters: ["default"],
	globals: { "ts-jest": { diagnostics: false } },
	transform: {},
	setupFiles: ["./jestSetup.ts"],
	silent: true,
	verbose: true,
	automock: false,
	testPathIgnorePatterns: [
		"<rootDir>/src/rules/applyItemRule.test.ts",
		"<rootDir>/src/rules/applyApprovalRule.test.ts",
		"<rootDir>/tests/index.integ.ts",
		"<rootDir>/dist",
	]
};
