import { describe, it, expect } from '@jest/globals';
import Product from './product';
import Classification from './classification';
import { mockClassification, mockProduct } from '../../test/mockKiwiValues';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Product', () => {
	
	const prod1Vals = mockProduct();
	const prod2Vals = mockProduct({ 
		id: 2, 
		name: 'Example App', 
		classification: 2,
		description: 'An example mobile app'
	});
	
	it('Can instantiate a Product', () => {
		
		const prod = new Product(prod1Vals);
		
		expect(prod['serialized']).toEqual(prod1Vals);
	});
	
	describe('Access local properties', () => {
		const prod1 = new Product(prod1Vals);
		const prod2 = new Product(prod2Vals);
		
		it('Can get Product description', () => {
			expect(prod1.getDescription()).toEqual('Example Website');
			expect(prod2.getDescription()).toEqual('An example mobile app');
		});
		
		it('Can get ID of Products classification', () => {
			expect(prod1.getClassificationId()).toEqual(1);
			expect(prod2.getClassificationId()).toEqual(2);
		});
		
		it('Can get Classification that a Product falls under', async () => {
			const class1Vals = mockClassification();
			const class2Vals = mockClassification({ 
				id: 2,
				name: 'Mobile App'
			});
			
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [class1Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [class2Vals]
			}));
			
			expect(await prod1.getClassification())
				.toEqual(new Classification(class1Vals));
			expect(await prod2.getClassification())
				.toEqual(new Classification(class2Vals));
		});
	});
	
	describe('Fetch from server', () => {
		it('Can get Product by ID', async () => {
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [prod1Vals] 
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [prod2Vals] 
			}));

			const prod1 = await Product.getById(1);
			const prod2 = await Product.getById(2);
			expect(prod1['serialized']).toEqual(prod1Vals);
			expect(prod2['serialized']).toEqual(prod2Vals);
		});
		
		it('Can get Product by Name', async () => {
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [prod1Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [prod2Vals]
			}));
			
			const prod1 = await Product.getByName('Example.com Website');
			const prod2 = await Product.getByName('Example App');
			expect(prod1['serialized']).toEqual(prod1Vals);
			expect(prod2['serialized']).toEqual(prod2Vals);
		});
	});
	
	
	
});
