import { 
	IServerDetails, 
	RpcResult, 
	RpcParam, 
	IRpcRequestBody, 
	IRpcResponseBody 
} from './networkTypes';
import RequestHandler from './requestHandler';

const rpcEndpoint = '/json-rpc/';

export default class KiwiConnector {
	
	private static serverUrl: string;
	
	// TODO: Update to handle default SSL for Kiwi 12.5
	/**
	 * Initialize Kiwi Connector for a specific server
	 * @param {IServerDetails}  serverDetails - Details of the server
	 * @param {string} serverDetails.hostName - Domain name / IP address
	 * @param {boolean} [serverDetails.useSSL] - Whether to use HTTPS or not
	 * @param {number} [serverDetails.port] - Port number.  Default: 80 or 443.
	 */
	public static init(serverDetails: IServerDetails): void {
		const protocol = `http${(serverDetails.useSSL ?? true) ? 's' : ''}://`;
		let host = serverDetails.hostName;
		if (host.endsWith('/')) {
			host = host.slice(0, -1);
		}
		const port = serverDetails.port ? `:${serverDetails.port}` : '';
		this.serverUrl = `${protocol}${host}${port}`;
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
			/* eslint-disable-next-line max-len */
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
	private static isRpcResponse(rpcResponse: unknown): 
	rpcResponse is IRpcResponseBody {
		const jsonRpcValid = 
			((rpcResponse as IRpcResponseBody).id === 'jsonrpc') && 
			((rpcResponse as IRpcResponseBody).jsonrpc === '2.0');
		const hasResult = ((rpcResponse as IRpcResponseBody)
			.result !== undefined);
		const hasError = ((rpcResponse as IRpcResponseBody)
			.error !== undefined);
		
		// Has required JSON-RPC fields, and a single result / error
		return (jsonRpcValid && (hasResult !== hasError));
		
	}
	
	public static async login(username: string, password: string): 
	Promise<string> {
		const sessionId =  await this.sendRPCMethod(
			'Auth.login', 
			[username, password]
		);
		return sessionId as string; // Valid session IDs are alphanumeric
	}
	
	public static async logout(): Promise<boolean> {
		const result = await this.sendRPCMethod('Auth.logout', []);
		return (result === '');
	}
}
