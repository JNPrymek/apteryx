import { describe, it, expect } from '@jest/globals';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';

import { 
	mockTestCaseProperty
} from '../../test/mockValues/testCases/mockTestCaseValues';
import TestCaseProperty from './testCaseProperty';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('TestCaseProperty', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const propVals = [
		mockTestCaseProperty(),
		mockTestCaseProperty({ id: 2, name: 'fizz', value: 'buzz' }),
	];

	it('Can instantiate a TestCaseProperty', () => {
		const prop1 = new TestCaseProperty(propVals[0]);
		expect(prop1['serialized']).toEqual(propVals[0]);
	});

	describe('Access local properties', () => {
		const prop1 = new TestCaseProperty(propVals[0]);
		const prop2 = new TestCaseProperty(propVals[1]);

		it('Can get TestCaseProperty ID', () => {
			expect(prop1.getId()).toEqual(1);
			expect(prop2.getId()).toEqual(2);
		});

		it('Can get TestCaseProperty TestCase ID', () => {
			expect(prop1.getCaseId()).toEqual(1);
			expect(prop2.getCaseId()).toEqual(1);
		});

		it('Can get TestCaseProperty Name', () => {
			expect(prop1.getName()).toEqual('foo');
			expect(prop2.getName()).toEqual('fizz');
		});

		it('Can get TestCaseProperty ID', () => {
			expect(prop1.getValue()).toEqual('bar');
			expect(prop2.getValue()).toEqual('buzz');
		});
	});

	describe('Server Lookups', () => {
		it('Can get a TestCaseProperty by ID (1 match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ propVals[0] ]
			}));
			expect(await TestCaseProperty.getById(1))
				.toEqual(new TestCaseProperty(propVals[0]));
		});

		it('Can get a TestCaseProperty by ID (2 matches)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					propVals[0],
					propVals[1]
				]
			}));
			const result = await TestCaseProperty.getByIds([1, 2]);
			expect(result).toEqual(expect.arrayContaining([
				new TestCaseProperty(propVals[0]),
				new TestCaseProperty(propVals[1])
			]));
		});

		it('Can get a TestCaseProperty by ID (No match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));
			expect(TestCaseProperty.getById(1))
				.rejects
				.toThrowError('Could not find any TestCase Property with ID 1');
		});
	});
});
