import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Classification from './classification';
import { ClassificationValues } from './classification.type';
import { mockClassification } from '../../test/mockKiwiValues';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Classification', () => {
	
	const class1Vals: ClassificationValues = mockClassification();
	const class2Vals: ClassificationValues = mockClassification({ 
		id: 2, 
		name: 'Mobile App' 
	});
	
	it('Can instantiate a Classification', () => {
		const class1 = new Classification(class1Vals);
		const class2 = new Classification(class2Vals);
		
		expect(class1['serialized']).toEqual(class1Vals);
		expect(class2['serialized']).toEqual(class2Vals);
	});

	describe('Local Properties', () => {
		const class1 = new Classification(class1Vals);
		const class2 = new Classification(class2Vals);

		it('Can get Classification ID', () => {
			expect(class1.getId()).toEqual(1);
			expect(class2.getId()).toEqual(2);
		});

		it('Can get Classification Name', () => {
			expect(class1.getName()).toEqual('Website');
			expect(class2.getName()).toEqual('Mobile App');
		});
	});

	describe('Server Lookups', () => {
		it('Can get Classification by ID', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse(
				{ result: [class1Vals] }
			));
			mockAxios.post.mockResolvedValue(mockRpcResponse(
				{ result: [class2Vals] }
			));
			
			const class1 = await Classification.getById(1);
			const class2 = await Classification.getById(2);
			expect(class1['serialized']).toEqual(class1Vals);
			expect(class2['serialized']).toEqual(class2Vals);
		});
		
		it('Can get Classification by Name', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [class1Vals] }));
			
			const class1 = await Classification.getByName('Website');
			expect(class1['serialized']).toEqual(class1Vals);
		});
	});
	
});
