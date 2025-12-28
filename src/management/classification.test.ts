import { describe, expect, it } from '@jest/globals';
import { mockClassification } from '../../test/mockKiwiValues';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import RequestHandler from '../core/requestHandler';
import Classification from './classification';
import { ClassificationValues } from './classification.type';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest = RequestHandler.sendPostRequest as jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Classification', () => {
	const class1Vals: ClassificationValues = mockClassification();
	const class2Vals: ClassificationValues = mockClassification({
		id: 2,
		name: 'Mobile App',
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
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [class1Vals],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [class2Vals],
			}));

			const class1 = await Classification.getById(1);
			const class2 = await Classification.getById(2);
			expect(class1['serialized']).toEqual(class1Vals);
			expect(class2['serialized']).toEqual(class2Vals);
		});

		it('Can get Classification by Name', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [class1Vals],
			}));
			const class1 = await Classification.getByName('Website');
			expect(class1['serialized']).toEqual(class1Vals);
		});
	});
});
