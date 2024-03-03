
import { RpcParam } from '../../src/core/networkTypes';
import RequestHandler from '../../src/core/requestHandler';
export function assertPostRequestData(
	mockFunction: jest.MockedFunction<typeof RequestHandler.sendPostRequest>,
	method: string,
	params: RpcParam
): void {
	expect(mockFunction).toBeCalledWith(
		expect.anything(),
		{
			method,
			params,
			id: 'jsonrpc',
			jsonrpc: '2.0'
		}
	);
}
