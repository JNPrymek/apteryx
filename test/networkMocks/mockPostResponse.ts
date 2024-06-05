import { NetworkResponse, RpcResult } from '../../src/core/networkTypes';
import { kiwiTestServerInfo } from '../testServerDetails';

// Mock for the value returned by RequestHandler.sendPostRequest
export default function mockRpcNetworkResponse(
	data: {
		result?: RpcResult;
		error?: { code: number; message: string; };
	},
	setCookies?: Array<string>
): NetworkResponse {
	let setCookieHeaderString = '';

	if (setCookies) {
		setCookieHeaderString = setCookies.map( val => {
			return `${val}; domain=${kiwiTestServerInfo.hostName}; path=/`;
		}).join(', ');
	}

	const resHeader: Record<string, string> = setCookieHeaderString
		? {
			'set-cookie': setCookieHeaderString,
			'content-type': 'application/json',
		}
		: {
			'content-type': 'application/json',
		};
	
	const response: NetworkResponse = {
		status: 200, // RPC errors still return 200 OK status
		statusText: 'OK',
		headers: resHeader,
		body: JSON.stringify({
			id: 'jsonrpc',
			jsonrpc: '2.0',
			...data,
		}),
	};

	return response;
};
