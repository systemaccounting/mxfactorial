export default {
	preset: "ts-jest",
	testEnvironment: "node",
	reporters: ["default"],
	globals: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				diagnostics: false,
			},
		  ],
	},
	testMatch: [
		"**/__tests__/**/*.[jt]s?(x)",
		"**/?(*.)+(spec|test|integ).[tj]s?(x)"
	],
	silent: true,
	verbose: true,
	automock: false,
};
