import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Version from './version';
import Product from './product';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Version', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const serverVer1 = { 
		id: 1, 
		value: '1.0.0', 
		product: 2, 
		'product__name': 'Example Product 2' 
	};
	const serverVer2 = { 
		id: 2, 
		value: '1.0.3', 
		product: 2, 
		'product__name': 'Example Product 2' 
	};
	
	it('Can instantiate a Version', () => {
		
		const ver = new Version(serverVer1);
		
		expect(ver['serialized']).toEqual(serverVer1);
	});
	
	it('Can get Version by ID', async () => {
		mockAxios
			.post
			.mockResolvedValue(
				mockRpcResponse({ result: [serverVer1] })
			);
		const ver = await Version.getById(1);
		
		expect(ver['serialized']).toEqual(serverVer1);
	});
	
	it('Can get multiple Versions by IDs', async () => {
		mockAxios
			.post.
			mockResolvedValue(
				mockRpcResponse({ result: [serverVer1, serverVer2] })
			);
		const vers = await Version.getByIds([1, 2]);
		
		expectArrayWithKiwiItem(vers, serverVer1);
		expectArrayWithKiwiItem(vers, serverVer2);
	});
	
	it('Can read the value of the Version', () => {
		
		const ver = new Version(serverVer1);
		
		expect(ver.getValue()).toEqual('1.0.0');
	});
	
	it('Can read the Product ID of the Version', () => {
		
		const ver = new Version(serverVer1);
		
		expect(ver.getProductId()).toEqual(2);
	});
	
	it('Can read the Product name of the Version', () => {
		
		const ver = new Version(serverVer1);
		
		expect(ver.getProductName()).toEqual('Example Product 2');
	});
	
	it('Can read the Product of the Version', async () => {
		
		const prod2Vals = {
			id: 2, 
			name: 'Example Product 2', 
			classification: 2, 
			description: 'Second Example Product'
		};
		
		mockAxios
			.post
			.mockResolvedValue(mockRpcResponse({ result: [prod2Vals] }));
		
		const version1 = new Version(serverVer1);
		expect(await version1.getProduct()).toEqual(new Product(prod2Vals));
		
	});
});