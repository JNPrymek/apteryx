import axios, { AxiosResponse } from 'axios';

import KiwiConnector from './kiwiConnector';

import { serverDomain, requestUrl } from '../../test/testServerDetails';
import expectAxiosPostCalledWith from '../../test/axiosAssertions/postCalledWith';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;



describe('Kiwi Connector', () => {
	
	it('Init runs without error', () => {
		expect(KiwiConnector.init({ hostName: serverDomain })).toBeUndefined();
	});
	
	// Send a Generic RPC method
	it('Can send a generic RPC method call', async () => {
		KiwiConnector.init({ hostName: serverDomain });
		mockAxios.post.mockResolvedValue(
			mockRpcResponse(
				{
					error: {
						code: -32601, 
						message: 'Method not found: "Test.nonExistentMethod"'
					}
				})
		);
		
		await expect(KiwiConnector.sendRPCMethod('Test.nonExistentMethod', ['arg', 1]))
			.rejects
			.toThrowError(/-32601 .* "Test\.nonExistentMethod"/);
		
		expectAxiosPostCalledWith(requestUrl, 'Test.nonExistentMethod', ['arg', 1]);
		
	});
	
	// Login
	it('Can login successfully', async () => {
		const mockSessionId = 'aX1bY2cZ3';
		const mockResponse = mockRpcResponse({ result: mockSessionId });
		const username = 'testUser';
		const password = 'Letmein123';
		
		KiwiConnector.init({ hostName: serverDomain });
		mockAxios.post.mockResolvedValue(mockResponse);
		
		await expect(KiwiConnector.login(username, password)).resolves.toBe(mockSessionId);
		expectAxiosPostCalledWith(requestUrl, 'Auth.login', [username, password]);
	});
	
	// Logout
	it('Can logout successfully', async () => {
		const mockResponse = mockRpcResponse({ result: '' });
		
		KiwiConnector.init({ hostName: serverDomain });
		mockAxios.post.mockResolvedValue(mockResponse);
		
		await expect(KiwiConnector.logout()).resolves.toBe(true);
		expectAxiosPostCalledWith(requestUrl, 'Auth.logout', []);
	});
	
	// Bad login
	it('Throws error when logging in with wrong credentials', async () => {
		const mockResponse = mockRpcResponse({error: { code: -32603, message: 'Internal error: Wrong username or password'}});
		const username = 'testUser';
		const password = 'wrongPassword';
		
		KiwiConnector.init({hostName: serverDomain});
		mockAxios.post.mockResolvedValue(mockResponse);
		
		await expect(KiwiConnector.login(username, password)).rejects.toThrowError(/-32603.*Wrong username or password/);
		expectAxiosPostCalledWith(requestUrl, 'Auth.login', [username, password]);
	});
	
	// Malformed Server Reply
	describe('Server HTTP Errors', () => {
		it('Errors on HTTP 400 status', async () => {
			const mockResponse: AxiosResponse<Record<string, unknown>> = {
				status: 400,
				statusText: 'Bad Request',
				config: {},
				headers: { 'content-type' : 'application/json'},
				data: {}
			};
			KiwiConnector.init({hostName: serverDomain});
			mockAxios.post.mockResolvedValue(mockResponse);
			
			await expect(KiwiConnector.login('username', 'password')).rejects.toThrowError(/Network Error 400 : Bad Request/);
		});
		
		it('Errors when RPC reply is missing "data" and "error" values', async () => {
			const mockResponse: AxiosResponse<Record<string, unknown>> = {
				status: 200,
				statusText: 'OK',
				config: {},
				headers: { 'content-type' : 'application/json'},
				data: {
					id: 'jsonrpc',
					jsonrpc: '2.0'
				}
			};
			KiwiConnector.init({hostName: serverDomain});
			mockAxios.post.mockResolvedValue(mockResponse);
			
			await expect(KiwiConnector.login('username', 'password')).rejects.toThrowError(/Malformed JSON-RPC reply/);
		});
		
	}); 
	
});