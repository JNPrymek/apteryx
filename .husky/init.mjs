// Skip Husky install in produciton / CI environments
// They usually don't need git hooks, and may not have devDependencies installed
if (
	process.env.NODE_ENV === 'production'
	|| process.env.CI === 'true'
	|| process.env.NPM_CONFIG_PRODUCTION === 'true'
) {
	process.exit(0);
}

const husky = (await import('husky')).default;
console.log(husky());
