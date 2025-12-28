import KiwiConnector from './kiwiConnector';
import RequestHandler from './requestHandler';

import { kiwiTestServerInfo } from '../../test/testServerDetails';
import {
	assertPostRequestData
} from '../../test/networkMocks/assertPostRequestData';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';

// Mock RequestHandler
jest.mock('./requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;


describe('Kiwi Connector', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	describe('Initialization', () => {
		it('Initializes with only hostname specified', () => {
			expect(KiwiConnector.init({ hostName: 'localhost' }))
				.toBeUndefined();

			expect(KiwiConnector['serverUrl']).toEqual('https://localhost');
		});
		
		it('Initialization removes trailing slash from hostname', () => {
			expect(KiwiConnector.init({ hostName: 'example.com/' }))
				.toBeUndefined();

			expect(KiwiConnector['serverUrl']).not.toContain('.com/');
		});
		
		it('Initializes when explicitely enabling ssl', () => {
			expect(KiwiConnector.init(
				{ hostName: kiwiTestServerInfo.hostName, useSSL: true }
			)).toBeUndefined();

			expect(KiwiConnector['serverUrl']).toContain('https://');
		});

		it('Initializes when explicitely disabling ssl', () => {
			expect(KiwiConnector.init(
				{ hostName: kiwiTestServerInfo.hostName, useSSL: false }
			)).toBeUndefined();

			expect(KiwiConnector['serverUrl']).toContain('http://');
		});
		
		it('Initializes when using custom port', () => {
			expect(KiwiConnector.init({
				hostName: kiwiTestServerInfo.hostName,
				port: 3080
			})).toBeUndefined();

			expect(KiwiConnector['serverUrl']).toContain(':3080');
		});
		
	});
	
	describe('Requests', () => {
		beforeEach(() => {
			KiwiConnector.init(kiwiTestServerInfo);
		});

		// Send a Generic RPC method
		it('Can send a generic RPC method call', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse(
				{
					error: {
						code: -32601,
						message: 'Method not found: "Test.nonExistentMethod"',
					}
				}
			));
		
			await expect(async () =>
				KiwiConnector
					.sendRPCMethod('Test.nonExistentMethod', ['arg', 1]))
				.rejects
				.toThrow(/-32601 .* "Test\.nonExistentMethod"/);

			assertPostRequestData({
				mockPostRequest,
				method: 'Test.nonExistentMethod',
				params: ['arg', 1],
			});
		
		});
	
		// Login
		it('Can login successfully', async () => {
			const mockSessionId = 'aX1bY2cZ3';
			const username = 'testUser';
			const password = 'Letmein123';

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: mockSessionId,
			}));
		
			await expect(KiwiConnector.login(username, password))
				.resolves.toBe(mockSessionId);
			assertPostRequestData({
				mockPostRequest,
				method: 'Auth.login',
				params: [username, password]
			});
		});
	
		// Logout
		it('Can logout successfully', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: '',
			}));
		
			await expect(KiwiConnector.logout()).resolves.toBe(true);
			assertPostRequestData({
				mockPostRequest,
				method: 'Auth.logout',
				params: []
			});
		});
	
		// Bad login
		it('Throws error when logging in with wrong credentials', async () => {
			const username = 'testUser';
			const password = 'wrongPassword';
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				error: {
					code: -32603,
					message: 'Internal error: Wrong username or password',
				}
			}));

			await expect(async () => 
				KiwiConnector.login(username, password))
				.rejects
				.toThrow(/-32603.*Wrong username or password/);
			assertPostRequestData({
				mockPostRequest,
				method: 'Auth.login',
				params: [username, password]
			});
		});

		describe('Server HTTP Errors', () => {
			it('Errors on HTTP 400 status', async () => {
				mockPostRequest.mockResolvedValue({
					status: 400,
					statusText: 'Bad Request',
					headers: { 'content-type': 'application/json' },
					body: '',
				});
				await expect(async () => 
					KiwiConnector.sendRPCMethod('foo', ['foo']))
					.rejects
					.toThrow(/Network Error 400 : Bad Request/);
			});

			// eslint-disable-next-line max-len
			it('Errors when RPC reply is missing both "data" and "error" values', 
				async () => {
					mockPostRequest.mockResolvedValue(
						mockRpcNetworkResponse({})
					);
					
					await expect(async () =>
						KiwiConnector.login('username', 'password'))
						.rejects
						.toThrow(/Malformed JSON-RPC reply/);
				});
		}); 
	});
});
