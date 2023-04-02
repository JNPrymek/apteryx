import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Version from './version';
import Product from './product';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import { mockVersion, mockProduct } from '../../test/mockKiwiValues';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Version', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
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
			
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [product1Vals] })
			);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [product2Vals] })
			);
			
			expect(await version1.getProduct())
				.toEqual(new Product(product1Vals));
			expect(await version2.getProduct())
				.toEqual(new Product(product2Vals));
			
		});
	});
	
	describe('Server lookups', () => {
		it('Can get Version by ID', async () => {
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [version1Vals] })
				);
			const ver = await Version.getById(1);
			
			expect(ver['serialized']).toEqual(version1Vals);
		});
		
		it('Can get multiple Versions by IDs', async () => {
			mockAxios
				.post.
				mockResolvedValue(
					mockRpcResponse({ result: [version1Vals, version2Vals] })
				);
			const vers = await Version.getByIds([1, 2]);
			
			expectArrayWithKiwiItem(vers, version1Vals);
			expectArrayWithKiwiItem(vers, version2Vals);
		});
	});
});
