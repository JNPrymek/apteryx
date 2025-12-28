import { describe, expect, it } from '@jest/globals';
import { mockPlanType } from '../../test/mockKiwiValues';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import RequestHandler from '../core/requestHandler';
import PlanType from './planType';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest = RequestHandler.sendPostRequest as jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('PlanType', () => {
	const type1Vals = mockPlanType();
	const type2Vals = mockPlanType({
		id: 2,
		name: 'Regression',
		description: 'Test Description',
	});

	it('Can instantiate a new PlanType', () => {
		const type1 = new PlanType(type1Vals);
		expect(type1['serialized']).toEqual(type1Vals);
		const type2 = new PlanType(type2Vals);
		expect(type2['serialized']).toEqual(type2Vals);
	});

	describe('Can access local properties', () => {
		const type1 = new PlanType(type1Vals);
		const type2 = new PlanType(type2Vals);

		it('Can get PlanType ID', () => {
			expect(type1.getId()).toEqual(1);
			expect(type2.getId()).toEqual(2);
		});

		it('Can get PlanType Name', () => {
			expect(type1.getName()).toEqual('Unit');
			expect(type2.getName()).toEqual('Regression');
		});

		it('Can get PlanType Description', () => {
			expect(type1.getDescription())
				.toEqual('Tests for a small portion of code');
			expect(type2.getDescription()).toEqual('Test Description');
		});
	});

	describe('Basic Server Functions', () => {
		const type1 = new PlanType(type1Vals);

		it('Can get PlanType by a single ID (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [type1Vals],
			}));
			const result = await PlanType.getById(1);
			expect(result).toEqual(type1);
		});

		it('Can get PlanType by single ID (no match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			expect(PlanType.getById(1))
				.rejects
				.toThrow('Could not find any PlanType with ID 1');
		});

		it('Can get PlanType by Name (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [type1Vals],
			}));
			const cat = await PlanType.getByName('Unit');
			expect(cat).toEqual(type1);
		});

		it('Can get PlanType by Name (0 matches)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			const name = 'Non-used name';
			expect(PlanType.getByName(name))
				.rejects
				.toThrow(
					`PlanType with name "${name}" could not be found.`,
				);
		});
	});
});
