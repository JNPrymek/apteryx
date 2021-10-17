
import { AxiosResponse } from 'axios';
import { IRpcResponseBody, RpcResult } from '../../src/core/networkTypes';
import { serverDomain } from '../testServerDetails';

export default function mockRpcResponse(
	data: { 
		result?: RpcResult, 
		error?: { code: number, message: string }
	},
	setCookies?: Array<string>
): AxiosResponse<IRpcResponseBody> {
	
	let setCookieHeaderString = '';
	if (setCookies) {
		for (const cookieKeyVal of setCookies) {
			if (setCookieHeaderString !== '' ) {
				setCookieHeaderString += ', ';
			}
			setCookieHeaderString += `${cookieKeyVal}; domain=${serverDomain}; path=/`;
		}
	}
	
	//const setCookieHeader = setCookieHeaderString ? ({ 'set-cookie' : setCookieHeaderString }) : ({});
	const resHeader: Record<string, string> = setCookieHeaderString ? 
		{
			'set-cookie' : setCookieHeaderString,
			'content-type' : 'application/json'
		} 
		:
		{
			'content-type' : 'application/json'
		};
	
	const response: AxiosResponse<IRpcResponseBody> = {
		status: 200,
		statusText: 'OK',
		config: {},
		headers: resHeader,
		data: {
			... data,
			id: 'jsonrpc',
			jsonrpc: '2.0'
		}
	};
	
	return response;
}