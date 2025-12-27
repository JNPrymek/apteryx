import { describe, it, expect } from '@jest/globals';
import { mockCategory, mockProduct } from '../../test/mockKiwiValues';
import Product from '../management/product';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import {
	assertPostRequestData
} from '../../test/networkMocks/assertPostRequestData';

import Category from './category';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Category', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const cat1Vals = mockCategory();
	const cat2Vals = mockCategory({
		id: 2,
		name: 'Sanity',
		product: 1,
		description: 'High-level tests',
	});

	it('Can instantiate a Category', () => {
		const cat1 = new Category(cat1Vals);
		expect(cat1['serialized']).toEqual(cat1Vals);
		const cat2 = new Category(cat2Vals);
		expect(cat2['serialized']).toEqual(cat2Vals);
	});

	describe('Can access local properties', () => {
		
		const category1 = new Category(cat1Vals);
		const category2 = new Category(cat2Vals);

		it('Can get Category ID', () => {
			expect(category1.getId()).toEqual(1);
			expect(category2.getId()).toEqual(2);
		});

		it('Can get Category Product', async () => {
			const product1Vals = mockProduct();
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [product1Vals]
			}));
			const categoryProduct = await category1.getProduct();
			expect(categoryProduct).toEqual(new Product(product1Vals));
		});

		it('Can get Category Product ID', () => {
			expect(category1.getProductId()).toEqual(1);
			expect(category2.getProductId()).toEqual(1);
		});

		it('Can get Category Product Name', () => {
			expect(category1.getDescription()).toEqual('The default category');
			expect(category2.getDescription()).toEqual('High-level tests');
		});
	});

	describe('Basic Server Functions', () => {

		const cat1 = new Category(cat1Vals);

		it('Can get Category by a single ID (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [cat1Vals] 
			}));
			const result = await Category.getById(1);
			expect(result).toEqual(cat1);
		});
		
		it('Can get Category by single ID (no match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			expect(Category.getById(1))
				.rejects
				.toThrow('Could not find any Category with ID 1');
		});

		it('Can get Category by Name (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [cat1Vals]
			}));
			const cat = await Category.getByName('Regression');
			expect(cat).toEqual(cat1);
		});

		it('Can get Category by Name (0 matches)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			const name = 'Non-used name';
			expect(Category.getByName(name))
				.rejects
				.toThrow(
					`Category with name "${name}" could not be found.`
				);
		});

	});

	describe('Resolve Category IDs', () => {
		it('Can resolve a Category ID from a number',  async () => {
			expect(Category.resolveCategoryId(1)).resolves.toEqual(1);
			expect(Category.resolveCategoryId(100)).resolves.toEqual(100);
			expect(Category.resolveCategoryId(245)).resolves.toEqual(245);
		});

		it('Can resolve Category ID from a Category object', () => {
			const cat1 = new Category(cat1Vals);
			const cat2 = new Category(cat2Vals);
			expect(Category.resolveCategoryId(cat1)).resolves.toEqual(1);
			expect(Category.resolveCategoryId(cat2)).resolves.toEqual(2);
		});

		it('Can resolve Category ID from a name', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ cat2Vals ]
			}));
			expect(await Category.resolveCategoryId('Sanity')).toEqual(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'Category.filter',
				params: [{ name: 'Sanity' }],
			});
		});
	});

});
