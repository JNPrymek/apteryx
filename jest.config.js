/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/dist/',
		'<rootDir>/debug/',
		'<rootDir>/ignored/',
		'<rootDir>/tmp/',
		'<rootDir>/temp/',
		'<rootDir>/test/api/'
	],
	collectCoverageFrom: [
		'<rootDir>/src/**/*.{js,ts}',
		'!<rootDir>/src/**/*.test.{js,ts}'
	],
	coverageThreshold: {
		'global': {
			'branches': 80,
			'functions': 80,
			'lines': 80,
			'statements': -10
		}
	}
};
