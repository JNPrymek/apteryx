
export const kiwiTestServerInfo = {
	hostName: process.env.KIWI_HOSTNAME ?? 'localhost',
	useSSL: process.env.KIWI_USE_SSL ? (
		process.env.KIWI_USE_SSL.toLowerCase() === 'true'
	) : true,
	port: process.env.KIWI_PORT ? parseInt(process.env.KIWI_PORT) : undefined,
	username: process.env.KIWI_USERNAME ?? 'debug',
	password: process.env.KIWI_PASSWORD ?? 'debug',
};
