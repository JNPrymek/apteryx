import axios, { AxiosResponse } from 'axios';
import { Cookie } from 'tough-cookie';

import RequestHandler from './requestHandler';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('HTTP Request Handler', () => {
	
	const serverDomain = 'example.com';
	const serverUrl = `https://${serverDomain}`;
	const requestPath = `${serverUrl}/json-rpc/`;
	
	const mockSuccessPostResponse: AxiosResponse<Record<string, unknown>> = {
		status: 200,
		statusText: 'OK',
		config: {},
		headers: {
			/* eslint-disable-next-line max-len */
			'set-cookie' : `resCustomCookie=abcdefg; expires=Sat, 30-Dec-2221 06:12:11 GMT; path=/; domain=${serverDomain}`
		},
		data: {
			a: 'a',
			b: true,
			c: 3
		}
	};
	
	// Initialize some test cookies
	const cookieVals: Array<Record<string, unknown>> = [
		{ key: 'test-a-key', value: 'test-a-value', domain: serverDomain },
		{ key: 'test-b-key', value: 'test-b-value', domain: serverDomain },
		{ key: 'test-c-key', value: 'test-c-value', domain: serverDomain }
	];
	
	// Remove all cookies from Cookie Jar before each test
	beforeEach( async () => {
		RequestHandler.cookieJar.removeAllCookies();
	});
	
	// Handler can send a POST request with given data and return the response
	it('Can send a POST request with provided data and get response data', 
		async () => {
			const reqHeaders = {
				accept:  'application/json',
				'X-Requested-With': 'Axios'
			};
		
			const reqBody = {
				foo: 'bar',
				baz: true,
				arr: ['a', 'b', 'c']
			};
		
			// Mock response
			mockAxios.post.mockResolvedValue(mockSuccessPostResponse);
		
			const response = await RequestHandler.sendPostRequest(
				requestPath,
				reqBody,
				reqHeaders
			);
			expect(axios.post).toHaveBeenCalledWith(
				requestPath, 
				reqBody, 
				{ headers: expect.objectContaining(reqHeaders) }
			);
			expect(response).toEqual(mockSuccessPostResponse);
		});
	
	
	describe('Save Cookies to Jar', () => {
		const cookieA = new Cookie(cookieVals[0]);
		const cookieB = new Cookie(cookieVals[1]);
		// Save cookie string to jar
		it('Can save single cookie string to jar', async () => {
			await RequestHandler.saveCookiesFromHeader(serverUrl,
				{ 'set-cookie': cookieA.cookieString() }
			);
			const cookiesInJar = await RequestHandler
				.cookieJar
				.getCookies(serverUrl);
			expect(cookiesInJar)
				.toEqual([expect.objectContaining(cookieVals[0])]);
		});
		
		// Save multiple cookie strings to jar
		it('Can save multiple cookie strings to jar', async () => {
			await RequestHandler.saveCookiesFromHeader(serverUrl,
				{ 'set-cookie': [
					cookieA.cookieString(), 
					cookieB.cookieString()
				] }
			);
			const cookiesInJar = await RequestHandler
				.cookieJar
				.getCookies(serverUrl);
			expect(cookiesInJar).toEqual([
				expect.objectContaining(cookieVals[0]), 
				expect.objectContaining(cookieVals[1])
			]);
		});
		
		// Save cookie to jar from POST response
		it('Can save cookies returned by a POST response', async () => {
			const reqHeaders = {
				accept:  'application/json',
				'X-Requested-With': 'Axios'
			};
			
			const reqBody = {
				foo: 'bar',
				baz: true,
				arr: ['a', 'b', 'c']
			};
			
			// Mock response
			mockAxios.post.mockResolvedValue(mockSuccessPostResponse);
			
			const response = await RequestHandler.sendPostRequest(
				requestPath,
				reqBody,
				reqHeaders
			);
			
			expect(response.headers)
				.toEqual(expect.objectContaining(
					mockSuccessPostResponse.headers
				));
			
			const cookiesInJar = await RequestHandler
				.cookieJar
				.getCookies(requestPath);
			expect(cookiesInJar)
				.toEqual(
					expect.arrayContaining([
						expect.objectContaining(
							{
								domain: 'example.com',
								path: '/',
								key: 'resCustomCookie',
								value: 'abcdefg',
								hostOnly: false,
								// Nested assertions, can't exact match date
								expires: expect.any(Date) 
							}
						)
					])
				);
		});
	});
	
	// Cookies Send with POST request
	it('Can send a POST request with provided data and get response data', 
		async () => {
		
			// Prep Test Cookies
			await RequestHandler
				.cookieJar
				.setCookie(new Cookie(cookieVals[0]), serverUrl);
			await RequestHandler
				.cookieJar
				.setCookie(new Cookie(cookieVals[2]), serverUrl);
			const cookieHeaderString = await RequestHandler
				.cookieJar
				.getCookieString(serverUrl);

			const reqHeaders = {
				accept:  'application/json',
				'X-Requested-With': 'Axios'
			};
		
			const reqBody = {
				foo: 'bar',
				baz: true,
				arr: ['a', 'b', 'c']
			};
		
			// Mock response
			mockAxios.post.mockResolvedValue(mockSuccessPostResponse);
		
			const response = await RequestHandler.sendPostRequest(
				requestPath,
				reqBody,
				reqHeaders
			);
			expect(axios.post).toHaveBeenCalledWith(
				requestPath, 
				reqBody, 
				{ headers: expect.objectContaining({
					Cookie: cookieHeaderString
				}) }
			);
			expect(response).toEqual(mockSuccessPostResponse);
		});
	
	// POST response can delete cookies
	// TODO
	
	// Clear all cookies
	it('Can clear all cookies from the jar', async () => {
		
		for (const cookieVal of cookieVals) {
			await RequestHandler
				.cookieJar
				.setCookie(new Cookie(cookieVal), serverUrl);
		}
		
		// Verify cookies are present
		let cookiesInJar = await RequestHandler.cookieJar.getCookies(serverUrl);
		expect(cookiesInJar)
			.toEqual(expect.arrayContaining([
				expect.objectContaining(cookieVals[0]),
				expect.objectContaining(cookieVals[1])
			]));
		
		// Empty cookie jar
		await RequestHandler.clearCookieJar();
		cookiesInJar = await RequestHandler.cookieJar.getCookies(serverUrl);
		expect(cookiesInJar).toEqual(expect.arrayContaining([]));
		expect(cookiesInJar).toHaveLength(0);
		
	});
	
});
