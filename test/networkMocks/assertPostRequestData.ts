
import { RpcParam } from '../../src/core/networkTypes';
import RequestHandler from '../../src/core/requestHandler';

export function assertPostRequestData({
	mockPostRequest,
	method,
	params,
	callIndex = 0,
}: {
	mockPostRequest: jest.MockedFunction<typeof RequestHandler.sendPostRequest>;
	method: string;
	params: RpcParam;
	callIndex?: number;
}): void {
	const call = mockPostRequest.mock.calls[callIndex];
	expect(typeof call[0]).toBe('string'); // URL 
	expect(call[1]).toEqual({
		method,
		params,
		id: 'jsonrpc',
		jsonrpc: '2.0',
	});
}
