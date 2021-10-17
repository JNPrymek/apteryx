import { IServerDetails, RpcResult, RpcParam, IRpcRequestBody, IRpcResponseBody } from './networkTypes';
import RequestHandler from './requestHandler';

const rpcEndpoint = '/json-rpc/';

export default class KiwiConnector {
	
	private static serverUrl: string;
	
	public static init(serverDetails: IServerDetails): void {
		this.serverUrl = `http${serverDetails.useSSL ? 's' : ''}://${serverDetails.hostName}${serverDetails.port ? serverDetails.port : ''}`;
		RequestHandler.clearCookieJar();
	}
	
	/**
	 * Send an RPC Method call to the server's JSON-RPC endpoint
	 * @param methodName Name of the method to call
	 * @param methodArgs Parameters to pass to the called method
	 * @returns Value returned by the method
	 */
	public static async sendRPCMethod(
		methodName: string,
		methodArgs: RpcParam)
		:Promise<RpcResult> {
		
		// Construct the body of the POST request
		const reqBody: IRpcRequestBody = {
			method: methodName,
			params: methodArgs,
			id: 'jsonrpc',
			jsonrpc: '2.0'
		};
		
		// Send request
		const response = await RequestHandler.sendPostRequest(
			`${this.serverUrl}${rpcEndpoint}`,
			reqBody
		);
		
		// Check POST request status
		if (response.status !== 200) {
			throw new Error(`Network Error ${response.status} : ${response.statusText}`);
		}
		
		// Check status of the RPC response
		if(this.isRpcResponse(response.data)) {
			// If RPC method resulted in error, throw that error
			if(response.data.error) {
				const err = response.data.error;
				throw new Error(`RPC Error:  ${err.code} - ${err.message}`);
			}
			
			// result is implied to exist if code reaches this point
			return response.data.result as RpcResult;
		}
		else {
			// Completely wrong data returned
			throw new Error('RPC Error:  Malformed JSON-RPC reply.');
		}
	}
	
	// Type guard HTTP response data into RPC Response
	private static isRpcResponse(rpcResponse: unknown): rpcResponse is IRpcResponseBody {
		const jsonRpcValid = 
			((rpcResponse as IRpcResponseBody).id === 'jsonrpc') && 
			((rpcResponse as IRpcResponseBody).jsonrpc === '2.0');
		const hasResult = ((rpcResponse as IRpcResponseBody).result !== undefined);
		const hasError = ((rpcResponse as IRpcResponseBody).error !== undefined);
		
		// Has required JSON-RPC fields, and a single result / error
		return (jsonRpcValid && (hasResult !== hasError));
		
	}
	
	public static async login(username: string, password: string): Promise<string> {
		const sessionId =  await this.sendRPCMethod('Auth.login', [username, password]);
		return sessionId as string; // Valid session IDs are alphanumeric
	}
	
	public static async logout(): Promise<boolean> {
		const result = await this.sendRPCMethod('Auth.logout', []);
		return (result === '');
	}
}