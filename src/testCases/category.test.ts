import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Product from '../management/product';

import Category from './category';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Category', () => {

	const cat1Vals = {
		id: 4,
		name: 'Regression',
		product: 1,
		'product_name': 'Example.com Website',
	};

	const cat2Vals = {
		id: 2,
		name: 'Sanity',
		product: 1,
		'product_name': 'Example.com Website',
	};

	it('Can instantiate a Category', () => {
		const cat1 = new Category(cat1Vals);
		expect(cat1['serialized']).toEqual(cat1Vals);
	});

	describe('Can access local properties', () => {
		
		const cat1 = new Category(cat1Vals);
		const cat2 = new Category(cat2Vals);

		it('Can get Category ID', () => {
			expect(cat1.getId()).toEqual(4);
			expect(cat2.getId()).toEqual(2);
		});

		it('Can get Category Product', async () => {
			const serverProd1 = {id: 1, name: 'Example.com Website', classification: 2, description: 'Example Product 1'};
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverProd1]}));
			const categoryProduct = await cat1.getProduct();
			expect(categoryProduct).toEqual(new Product(serverProd1));
		});

		it('Can get Category Product ID', () => {
			expect(cat1.getProductId()).toEqual(1);
			expect(cat2.getProductId()).toEqual(1);
		});

		it('Can get Category Product Name', () => {
			expect(cat1.getProductName()).toEqual('Example.com Website');
			expect(cat2.getProductName()).toEqual('Example.com Website');
		});
	});

	describe('Basic Server Functions', () => {

		const cat1 = new Category(cat1Vals);
		const cat2 = new Category(cat2Vals);

		it('Can get Category by a single ID (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [cat1Vals]}));
			const result = await Category.getById(1);
			expect(result).toEqual(cat1);
		});
		
		it('Can get Category by single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			expect(Category.getById(1)).rejects.toThrowError('Could not find any Category with ID 1');
		});

		it('Can get Category by Name (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [cat1Vals]}));
			const cat = await Category.getByName('Regression');
			expect(cat).toEqual(cat1);
		});

		it('Can get Category by Name (0 matches)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			const name = 'Non-used name';
			expect(Category.getByName(name)).rejects.toThrowError(`Category with name "${name}" could not be found.`);
		});

	});

});
