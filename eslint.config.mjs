import { defineConfig, globalIgnores } from 'eslint/config';

import globals from 'globals';

// Plugins
import tseslint from 'typescript-eslint';

export default defineConfig([
	tseslint.configs.recommended,
	{
		files: ['**/*.ts'],

		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 12,
			sourceType: 'module',
		},

		rules: {
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'comma-spacing': ['error', {
				before: false,
				after: true,
			}],
			'spaced-comment': ['error', 'always'],
		},
	},
	{
		files: ['**/*.test.ts'],
		rules: {
			// Allow Chai's expect().to.be.true; assertions
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
	globalIgnores([
		// Dependencies
		'**/node_modules',

		// Compiled files
		'./dist/',
		'./build/',
		'**/.eslintcache',

		// Debug / temporary folders
		'./debug/',
		'**/ignored/',
		'**/tmp/',
		'**/temp/',

		// Test output
		'**/coverage/',

		// Sample configuration
		'./config/',
	]),
]);
