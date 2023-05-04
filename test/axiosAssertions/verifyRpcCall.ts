import axios from 'axios';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function verifyRpcCall(
	mockAxiosRef: jest.Mocked<typeof axios>,
	callIndex: number,
	methodName: string,
	params: Array<string | number | Record<string, any>>
): void {
	const body: Record<string, any> = mockAxiosRef
		.post
		.mock
		.calls[callIndex][1] as Record<string, any>;
	expect(body.method).toEqual(methodName);
	expect(body.params).toEqual(params);
}