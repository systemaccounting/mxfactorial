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
		"**/?(*.)+(spec|test|integ).[tj]s?(x)"
	],
	silent: false,
	verbose: true,
	automock: false,
	testTimeout: 1000 * 60 * 2, // 2 mins
	roots: ["../"],
};
