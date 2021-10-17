import axios from 'axios';

jest.mock('axios');

export default function expectAxiosPostCalledWith(
	url: string,
	method: string,
	params: Array<string | number | Record<string, unknown>>,
	headers?: Record<string, unknown>
): void {
	const reqHeaders = headers ? headers : { 'Cookie' : '' };
	expect(axios.post).toBeCalledWith(
		url,
		{
			method,
			params,
			id: 'jsonrpc',
			jsonrpc: '2.0'
		},
		{
			headers: reqHeaders
		}
	);
}