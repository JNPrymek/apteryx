import fetch from 'node-fetch';
import { Cookie } from 'tough-cookie';

import RequestHandler from './requestHandler';
import {
	mockNetworkSuccessResponse
} from '../../test/networkMocks/mockNetworkResponse';

// Mock Fetch
jest.mock('node-fetch', () => (jest.fn()));
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;


describe('HTTP Request Handler', () => {

	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
		// Remove all cookies from Cookie Jar before each test
		RequestHandler.cookieJar.removeAllCookies();
	});
	
	const serverDomain = 'example.com';
	const serverUrl = `https://${serverDomain}`;
	const requestPath = `${serverUrl}/json-rpc/`;

	// Need to return different mock response objects per test
	// fetch.Response's body can only be read 1 time
	function getMockSuccessPostResponse() {
		return mockNetworkSuccessResponse({
			a: 'a',
			b: true,
			c: 3,
		},
		/* eslint-disable-next-line max-len */
		`resCustomCookie=abcdefg; expires=Sat, 30-Dec-2221 06:12:11 GMT; path=/; domain=${serverDomain}`
		);
	}
	
	// Initialize some test cookies
	const cookieVals: Array<Record<string, unknown>> = [
		{ key: 'test-a-key', value: 'test-a-value', domain: serverDomain },
		{ key: 'test-b-key', value: 'test-b-value', domain: serverDomain },
		{ key: 'test-c-key', value: 'test-c-value', domain: serverDomain }
	];
	
	// Handler can send a POST request with given data and return the response
	it('Can send a POST request with provided data and get response data', 
		async () => {
			const reqHeaders = {
				accept:  'application/json',
				'X-Requested-With': 'Node-Fetch'
			};
		
			const reqBody = {
				foo: 'bar',
				baz: true,
				arr: ['a', 'b', 'c']
			};
		
			// Mock response
			mockFetch.mockResolvedValue(getMockSuccessPostResponse());

			const response = await RequestHandler.sendPostRequest(
				requestPath,
				reqBody,
				reqHeaders
			);
			expect(fetch).toHaveBeenCalledWith(
				requestPath, 
				{
					body: JSON.stringify(reqBody),
					headers: expect.objectContaining(reqHeaders),
					method: 'POST',
				}
			);
			expect(response).toEqual({
				status: 200,
				statusText: 'OK',
				body: JSON.stringify({
					a: 'a',
					b: true,
					c: 3,
				}),
				headers: {
					'content-type': 'text/plain;charset=UTF-8',
					'set-cookie': 
						// eslint-disable-next-line max-len
						'resCustomCookie=abcdefg; expires=Sat, 30-Dec-2221 06:12:11 GMT; path=/; domain=example.com'
				}
			});
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
			const reqBody = {
				foo: 'bar',
				baz: true,
				arr: ['a', 'b', 'c']
			};
			
			// Mock response
			mockFetch.mockResolvedValue(getMockSuccessPostResponse());

			const response = await RequestHandler.sendPostRequest(
				requestPath,
				reqBody,
			);
			
			expect(response.headers)
				.toEqual(expect.objectContaining(
					Object.fromEntries(getMockSuccessPostResponse().headers)
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
	it('Can send a POST request with cookie and get response data', 
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
				'X-Requested-With': 'Node-Fetch'
			};
		
			const reqBody = {
				foo: 'bar',
				baz: true,
				arr: ['a', 'b', 'c']
			};
		
			// Mock response
			mockFetch.mockResolvedValue(getMockSuccessPostResponse());

			const response = await RequestHandler.sendPostRequest(
				requestPath,
				reqBody,
				reqHeaders
			);

			expect(fetch).toHaveBeenCalledWith(
				requestPath, 
				{
					body: JSON.stringify(reqBody),
					headers: expect.objectContaining({
						Cookie: cookieHeaderString,
					}),
					method: 'POST',
				}
			);
			expect(response).toEqual({
				status: 200,
				statusText: 'OK',
				body: JSON.stringify({
					a: 'a',
					b: true,
					c: 3,
				}),
				headers: {
					'content-type': 'text/plain;charset=UTF-8',
					'set-cookie': 
						// eslint-disable-next-line max-len
						'resCustomCookie=abcdefg; expires=Sat, 30-Dec-2221 06:12:11 GMT; path=/; domain=example.com'
				}
			});
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
