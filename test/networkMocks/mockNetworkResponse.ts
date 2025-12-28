import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

// Mock value for fetch() response
export function mockNetworkSuccessResponse(
	body: Record<string, unknown>,
	setCookieString?: string,
): fetch.Response {
	const bodyString = JSON.stringify(body);
	return new Response(bodyString, {
		status: 200,
		statusText: 'OK',
		headers: setCookieString
			? { 'set-cookie': setCookieString }
			: undefined,
	});
}

export function mockNetworkForbiddenResponse(
	body: Record<string, unknown>,
): Response {
	return new Response(JSON.stringify(body), {
		status: 403,
		statusText: 'Forbidden',
	});
}
