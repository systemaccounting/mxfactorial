export default {
	preset: "ts-jest",
	testEnvironment: "node",
	coverageDirectory: "./coverage",
	coveragePathIgnorePatterns: ["node_modules"],
	reporters: ["default"],
	globals: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				diagnostics: false,
			},
		  ],
	},
	transform: {},
	setupFiles: ["./jestSetup.ts"],
	testMatch: [
		"**/__tests__/**/*.[jt]s?(x)",
		"**/?(*.)+(spec|test).[tj]s?(x)"
	],
	silent: true,
	verbose: true,
	automock: false,
	testPathIgnorePatterns: [
		"<rootDir>/src/rules/applyItemRule.test.ts",
		"<rootDir>/src/rules/applyApprovalRule.test.ts",
		"<rootDir>/src/tests/local.integ.ts",
		"<rootDir>/dist",
	]
};
