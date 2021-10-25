import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Product from './product';
import Classification from './classification';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Product', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const serverProd1 = {id: 1, name: 'Prod1', classification: 2, description: 'Example Product 1'};
	
	it('Can instantiate a Product', () => {
		
		const prod = new Product(serverProd1);
		
		expect(prod['serialized']).toEqual(serverProd1);
	});
	
	it('Can get Product by ID', async () => {
		const serverItems: Array<Record<string, unknown>> = [serverProd1];
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: serverItems}));
		
		const prod1 = await Product.getById(1);
		expect(prod1['serialized']).toEqual(serverItems[0]);
	});
	
	it('Can get Product by Name', async () => {
		const serverItems: Array<Record<string, unknown>> = [serverProd1];
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: serverItems}));
		
		const prod1 = await Product.getByName('Prod1');
		expect(prod1['serialized']).toEqual(serverItems[0]);
	});
	
	it('Can get Product description', () => {
		const prod1 = new Product(serverProd1);
		expect(prod1.getDescription()).toEqual('Example Product 1');
	});
	
	it('Can get ID of Products classification', () => {
		const prod1 = new Product(serverProd1);
		expect(prod1.getClassificationId()).toEqual(2);
	});
	
	it('Can get Classification that a Product falls under', async () => {
		const prod1 = new Product(serverProd1);
		const class2 = new Classification({id: 2, name: 'Classification2'});
		
		// Mock Classification
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Classification.getById = jest.fn( async (id: number) => Promise.resolve(class2));
		
		const prod1Class = await prod1.getClassification();
		expect(prod1Class).toEqual(class2);
	});
	
});