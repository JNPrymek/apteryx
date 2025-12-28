export type NetworkResponse = {
	status: number;
	statusText: string;
	headers: Record<string, unknown>;
	body: string;
};

export type RpcResult =
	| null
	| string
	| number
	| Record<string, unknown>
	| Array<string | number | Record<string, unknown>>;

export type RpcError = {
	code: number;
	message: string;
};

export type RpcParam = Array<string | number | null | Record<string, unknown>>;

export type RpcResponseBody = {
	id: string;
	jsonrpc: string;
	result?: RpcResult;
	error?: RpcError;
};

export type RpcRequestBody = {
	id: 'jsonrpc';
	jsonrpc: '2.0';
	method: string;
	params: RpcParam;
};

export type ServerDetails = {
	useSSL?: boolean;
	hostName: string;
	port?: number;
};
