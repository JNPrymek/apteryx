
export type RpcResult = 
	string | 
	number | 
	Record<string, unknown> | 
	Array<string | number | Record<string, unknown>>;

export type RpcParam = Array<string | number | Record<string, unknown>>;

export interface IRpcRequestBody extends Record<string, unknown> {
	method: string;
	params: RpcParam;
	id: 'jsonrpc';
	jsonrpc: '2.0';
}

interface IRpcError {
	code: number;
	message: string;
}

export interface IRpcResponseBody {
	id: string;
	jsonrpc: string;
	result?: RpcResult;
	error?: IRpcError;
}

export interface IServerDetails {
	readonly useSSL?: boolean;
	readonly hostName: string;
	readonly port?: number;
}