
import { AxiosResponse } from 'axios';
import { RpcResponseBody, RpcResult } from '../../src/core/networkTypes';
import { kiwiTestServerInfo } from '../testServerDetails';

export default function mockRpcResponse(
	data: { 
		result?: RpcResult; 
		error?: { code: number; message: string; };
	},
	setCookies?: Array<string>
): AxiosResponse<RpcResponseBody> {
	
	let setCookieHeaderString = '';
	if (setCookies) {
		for (const cookieKeyVal of setCookies) {
			if (setCookieHeaderString !== '' ) {
				setCookieHeaderString += ', ';
			}
			/* eslint-disable-next-line max-len*/
			setCookieHeaderString += `${cookieKeyVal}; domain=${kiwiTestServerInfo.hostName}; path=/`;
		}
	}

	const resHeader: Record<string, string> = setCookieHeaderString ? 
		{
			'set-cookie' : setCookieHeaderString,
			'content-type' : 'application/json'
		} 
		:
		{
			'content-type' : 'application/json'
		};
	
	const response: AxiosResponse<RpcResponseBody> = {
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
