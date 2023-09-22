import axios, { AxiosResponse } from 'axios';

import KiwiConnector from './kiwiConnector';

import { kiwiTestServerInfo } from '../../test/testServerDetails';
import expectAxiosPostCalledWith 
	from '../../test/axiosAssertions/postCalledWith';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;



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

		const requestUrl = `https://${kiwiTestServerInfo.hostName}/json-rpc/`;
		beforeEach(() => {
			KiwiConnector.init({
				hostName: kiwiTestServerInfo.hostName,
				useSSL: true
			});
		});

		// Send a Generic RPC method
		it('Can send a generic RPC method call', async () => {
			KiwiConnector.init(kiwiTestServerInfo);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					error: {
						code: -32601, 
						message: 'Method not found: "Test.nonExistentMethod"'
					}
				})
			);
		
			await expect(KiwiConnector
				.sendRPCMethod('Test.nonExistentMethod', ['arg', 1]))
				.rejects
				.toThrowError(/-32601 .* "Test\.nonExistentMethod"/);

			expectAxiosPostCalledWith(
				requestUrl, 
				'Test.nonExistentMethod', 
				['arg', 1]
			);
		
		});
	
		// Login
		it('Can login successfully', async () => {
			const mockSessionId = 'aX1bY2cZ3';
			const mockResponse = mockRpcResponse({ result: mockSessionId });
			const username = 'testUser';
			const password = 'Letmein123';
		
			mockAxios.post.mockResolvedValue(mockResponse);
		
			await expect(KiwiConnector.login(username, password))
				.resolves.toBe(mockSessionId);
			expectAxiosPostCalledWith(
				requestUrl, 
				'Auth.login', 
				[username, password]);
		});
	
		// Logout
		it('Can logout successfully', async () => {
			const mockResponse = mockRpcResponse({ result: '' });

			mockAxios.post.mockResolvedValue(mockResponse);
		
			await expect(KiwiConnector.logout()).resolves.toBe(true);
			expectAxiosPostCalledWith(requestUrl, 'Auth.logout', []);
		});
	
		// Bad login
		it('Throws error when logging in with wrong credentials', async () => {
			const mockResponse = mockRpcResponse(
				{ 
					error: { 
						code: -32603, 
						message: 'Internal error: Wrong username or password' 
					} 
				}
			);
			const username = 'testUser';
			const password = 'wrongPassword';

			mockAxios.post.mockResolvedValue(mockResponse);
		
			await expect(KiwiConnector.login(username, password))
				.rejects
				.toThrowError(/-32603.*Wrong username or password/);
			expectAxiosPostCalledWith(
				requestUrl, 
				'Auth.login', 
				[username, password]
			);
		});

		describe('Server HTTP Errors', () => {
			it('Errors on HTTP 400 status', async () => {
				const mockResponse: AxiosResponse<Record<string, unknown>> = {
					status: 400,
					statusText: 'Bad Request',
					config: {},
					headers: { 'content-type' : 'application/json' },
					data: {}
				};
				mockAxios.post.mockResolvedValue(mockResponse);
			
				await expect(KiwiConnector.login('username', 'password'))
					.rejects
					.toThrowError(/Network Error 400 : Bad Request/);
			});

			// eslint-disable-next-line max-len
			it('Errors when RPC reply is missing both "data" and "error" values', 
				async () => {
					// eslint-disable-next-line max-len
					const mockResponse: AxiosResponse<Record<string, unknown>> = {
						status: 200,
						statusText: 'OK',
						config: {},
						headers: { 'content-type' : 'application/json' },
						data: {
							id: 'jsonrpc',
							jsonrpc: '2.0'
						}
					};
					mockAxios.post.mockResolvedValue(mockResponse);
			
					await expect(KiwiConnector.login('username', 'password'))
						.rejects
						.toThrowError(/Malformed JSON-RPC reply/);
				});
		}); 
	});
});
