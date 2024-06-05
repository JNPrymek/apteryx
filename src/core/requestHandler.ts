
import fetch from 'node-fetch';
import { CookieJar, Cookie } from 'tough-cookie';
import { NetworkResponse } from './networkTypes';

/**
 * Utility Class to handle HTTP requests and manage Cookies
 */
export default class RequestHandler {
	// Create Cookie Jar
	static cookieJar = new CookieJar();
	
	/**
	 * Deletes ALL cookies stored
	 */
	static async clearCookieJar(): Promise<void> {
		await this.cookieJar.removeAllCookies();
	}
	
	/**
	 * Sends a HTTP POST request, using cookies from the jar.
	 * @param url URL the POST request is sent to
	 * @param body Body of the POST request
	 * @param headers Headers of the POST request
	 * @returns An HTTP Response Object
	 */
	static async sendPostRequest(
		url: string, 
		body: Record<string, unknown>, 
		headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'User-Agent': 'Node-Fetch'
		}
	): Promise<NetworkResponse> {
		// Add cookies to request headers
		const sendHeaders = await this.appendCookiesToHeader(url, headers);
		
		// Send POST request
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: sendHeaders,
		});
		
		// Save new/edited cookies to jar
		await this.saveCookiesFromHeader(url, response.headers.raw());

		const responseBody: string = await response.text();

		const result: NetworkResponse = {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers),
			body: responseBody,
		};
		
		// Return results
		return result;
	}
	
	/**
	 * Append cookies from cookie jar to a HTTP request's Header object
	 * @param url URL to send the HTTP request is going to
	 * @param headers Headers object of the HTTP request
	 * @returns A copy of the Headers object, with 'Cookie' header
	 */
	static async appendCookiesToHeader(
		url: string, 
		headers: Record<string, string>
	): Promise<Record<string, string>> {
		const cookieHeader = await this.cookieJar.getCookieString(url);
		if (cookieHeader) {
			return { ...headers, Cookie:  cookieHeader };
		}
		return headers;
	}
	
	/**
	 * Save cookies from HTTP response to cookie jar
	 * @param url URL that the Request went to
	 * @param headers Headers object of the request's response
	 */
	static async saveCookiesFromHeader(
		url: string, 
		headers: Record<string, unknown>
	): Promise<void> {
		const setCookieHeader = headers['set-cookie'];
		
		// Set single cookie to jar
		if (typeof setCookieHeader === 'string') {
			const cookie = Cookie.parse(setCookieHeader);
			if (cookie) this.cookieJar.setCookie(cookie, url);
		}
		
		// Split array, then set each to jar
		if (Array.isArray(setCookieHeader)) {
			setCookieHeader.forEach( (cookieString: string) => {
				const cookie = Cookie.parse(cookieString);
				if (cookie) this.cookieJar.setCookie(cookie, url);
			});
		}
	}
}
