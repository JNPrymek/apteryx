import { describe, it, expect } from '@jest/globals';

import KiwiConnector from '../core/kiwiConnector';
import { kiwiTestServerInfo } from '../../test/testServerDetails';
import Version from './version';
import Product from './product';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import { mockVersion, mockProduct } from '../../test/mockKiwiValues';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Version', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
		KiwiConnector.init({ hostName: kiwiTestServerInfo.hostName });
	});
	
	const version1Vals = mockVersion();
	const version2Vals = mockVersion({
		id: 2,
		value: '1.0.3',
		product: 2,
		product__name: 'The other product'
	});
	
	it('Can instantiate a Version', () => {
		const ver = new Version(version1Vals);
		expect(ver['serialized']).toEqual(version1Vals);
	});
	
	describe('Access local properties', () => {
		const version1 = new Version(version1Vals);
		const version2 = new Version(version2Vals);
		it('Can read the value of the Version', () => {
			expect(version1.getValue()).toEqual('unspecified');
			expect(version2.getValue()).toEqual('1.0.3');
		});
		
		it('Can read the Product ID of the Version', () => {
			expect(version1.getProductId()).toEqual(1);
			expect(version2.getProductId()).toEqual(2);
		});
		
		it('Can read the Product name of the Version', () => {
			expect(version1.getProductName()).toEqual('Example.com Website');
			expect(version2.getProductName()).toEqual('The other product');
		});
		
		it('Can read the Product of the Version', async () => {
			const product1Vals = mockProduct();
			const product2Vals = mockProduct({
				id: 2,
				name: 'The other product'
			});
			
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [product1Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [product2Vals]
			}));
			
			expect(await version1.getProduct())
				.toEqual(new Product(product1Vals));
			expect(await version2.getProduct())
				.toEqual(new Product(product2Vals));
			
		});
	});
	
	describe('Server lookups', () => {
		it('Can get Version by ID', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [version1Vals]
			}));
			const ver = await Version.getById(1);
			
			expect(ver['serialized']).toEqual(version1Vals);
		});
		
		it('Can get multiple Versions by IDs', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [version1Vals, version2Vals]
			}));
			const vers = await Version.getByIds([1, 2]);
			
			expectArrayWithKiwiItem(vers, version1Vals);
			expectArrayWithKiwiItem(vers, version2Vals);
		});
	});
});
