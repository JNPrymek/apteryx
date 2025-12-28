import debug from 'debug';
import { RpcParam, RpcRequestBody, RpcResponseBody, RpcResult, ServerDetails } from './networkTypes';
import RequestHandler from './requestHandler';

const rpcEndpoint = '/json-rpc/';

export default class KiwiConnector {
	private static serverUrl: string;

	private static debugConnector = debug('apteryx:kiwiConnector');
	private static debugMethod = debug('apteryx:RpcMethod');

	// TODO: Update to handle default SSL for Kiwi 12.5
	/**
	 * Initialize Kiwi Connector for a specific server
	 * @param {IServerDetails}  serverDetails - Details of the server
	 * @param {string} serverDetails.hostName - Domain name / IP address
	 * @param {boolean} [serverDetails.useSSL] - Whether to use HTTPS or not
	 * @param {number} [serverDetails.port] - Port number.  Default: 80 or 443.
	 */
	public static init(serverDetails: ServerDetails): void {
		this.debugConnector('Initializing KiwiConnector with params: %o', serverDetails);
		const protocol = `http${(serverDetails.useSSL ?? true) ? 's' : ''}://`;
		let host = serverDetails.hostName;
		if (host.endsWith('/')) {
			host = host.slice(0, -1);
		}
		const port = serverDetails.port ? `:${serverDetails.port}` : '';
		this.serverUrl = `${protocol}${host}${port}`;
		this.debugConnector('Clearing cookie jar');
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
		methodArgs: RpcParam,
	): Promise<RpcResult> {
		// Construct the body of the POST request
		const reqBody: RpcRequestBody = {
			method: methodName,
			params: methodArgs,
			id: 'jsonrpc',
			jsonrpc: '2.0',
		};

		if (methodName === 'Auth.login') {
			const outputArgs = '[LOGIN_CREDENTIALS_REDACTED]';
			this.debugMethod(
				'Call RPC method "%s" with args %s',
				methodName,
				outputArgs,
			);
		} else {
			this.debugMethod(
				'Call RPC method "%s" with args: %O',
				methodName,
				methodArgs,
			);
		}

		// Send request
		const response = await RequestHandler.sendPostRequest(
			`${this.serverUrl}${rpcEndpoint}`,
			reqBody,
		);

		// Check POST request status
		if (response.status !== 200) {
			this.debugConnector(
				'Network Error %d : %s',
				response.status,
				response.statusText,
			);

			throw new Error(`Network Error ${response.status} : ${response.statusText}`);
		}

		let parsedBody: Record<string, unknown> | null = null;
		try {
			parsedBody = JSON.parse(response.body);
		} catch {
			this.debugConnector('RPC Error - invalid JSON %s', response.body);
			throw new Error('RPC Error:  Response body is not valid JSON');
		}

		// Check status of the RPC response
		if (this.isRpcResponse(parsedBody)) {
			// If RPC method resulted in error, throw that error
			if (parsedBody.error) {
				const err = parsedBody.error;
				this.debugConnector('RPC Error Response: %O', err);
				throw new Error(`RPC Error:  ${err.code} - ${err.message}`);
			}

			// result is implied to exist if code reaches this point
			return parsedBody.result as RpcResult;
		} else {
			// Completely wrong data returned
			this.debugConnector('RPC Error - Malformed JSON-RPC reply');
			throw new Error('RPC Error:  Malformed JSON-RPC reply.');
		}
	}

	// Type guard HTTP response data into RPC Response
	private static isRpcResponse(rpcResponse: unknown): rpcResponse is RpcResponseBody {
		// TODO - verify is object, and not null
		const jsonRpcValid = ((rpcResponse as RpcResponseBody).id === 'jsonrpc')
			&& ((rpcResponse as RpcResponseBody).jsonrpc === '2.0');
		const hasResult = (rpcResponse as RpcResponseBody)
			.result !== undefined;
		const hasError = (rpcResponse as RpcResponseBody)
			.error !== undefined;

		// Has required JSON-RPC fields, and a single result / error
		return (jsonRpcValid && (hasResult !== hasError));
	}

	public static async login(username: string, password: string): Promise<string> {
		this.debugMethod('Logging in as "%s"', username);
		const sessionId = await this.sendRPCMethod(
			'Auth.login',
			[username, password],
		);
		return sessionId as string; // Valid session IDs are alphanumeric
	}

	public static async logout(): Promise<boolean> {
		this.debugMethod('Logging out');
		const result = await this.sendRPCMethod('Auth.logout', []);
		return (result === '');
	}
}
