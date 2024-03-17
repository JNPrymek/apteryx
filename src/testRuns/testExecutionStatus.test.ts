import { describe, it, expect } from '@jest/globals';
import { mockTestExecutionStatus } from '../../test/mockKiwiValues';
import TestExecutionStatus from './testExecutionStatus';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Test Execution Status', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	// Data values
	const stat1Vals = mockTestExecutionStatus();
	const stat2Vals = mockTestExecutionStatus({
		id: 4,
		name: 'PASSED',
		weight: 20,
		color: '#92d400',
		icon: 'fa fa-check-circle-o'
	});
	const stat3Vals = mockTestExecutionStatus({
		id: 5,
		name: 'FAILED',
		weight: -30,
		color: '#cc0000',
		icon: 'fa fa-times-circle-o'
	});

	it('Can instantiate a TestExecutionStatus', () => {
		const tes1 = new TestExecutionStatus(stat1Vals);
		expect(tes1['serialized']).toEqual(stat1Vals);
		const tes2 = new TestExecutionStatus(stat2Vals);
		expect(tes2['serialized']).toEqual(stat2Vals);
		const tes3 = new TestExecutionStatus(stat3Vals);
		expect(tes3['serialized']).toEqual(stat3Vals);
	});

	const tes1 = new TestExecutionStatus(stat1Vals);
	const tes2 = new TestExecutionStatus(stat2Vals);
	const tes3 = new TestExecutionStatus(stat3Vals);
	
	describe('Can access local properties', () => {

		it('Can get TestExecutionStatus ID', () => {
			expect(tes1.getId()).toEqual(1);
			expect(tes2.getId()).toEqual(4);
			expect(tes3.getId()).toEqual(5);
		});

		it('Can get TestExecutionStatus Name', () => {
			expect(tes1.getName()).toEqual('IDLE');
			expect(tes2.getName()).toEqual('PASSED');
			expect(tes3.getName()).toEqual('FAILED');
		});

		it('Can get TestExecutionStatus Weight', () => {
			expect(tes1.getWeight()).toEqual(0);
			expect(tes2.getWeight()).toEqual(20);
			expect(tes3.getWeight()).toEqual(-30);
		});

		it('Can get TestExecutionStatus Icon', () => {
			expect(tes1.getIcon()).toEqual('fa fa-question-circle-o');
			expect(tes2.getIcon()).toEqual('fa fa-check-circle-o');
			expect(tes3.getIcon()).toEqual('fa fa-times-circle-o');
		});

		it('Can get TestExecutionStatus Color', () => {
			expect(tes1.getColor()).toEqual('#72767b');
			expect(tes2.getColor()).toEqual('#92d400');
			expect(tes3.getColor()).toEqual('#cc0000');
		});

		it('Can get TestExecutionStatus Color Hexcode', () => {
			expect(tes1.getColorHex()).toEqual('#72767b');
			expect(tes2.getColorHex()).toEqual('#92d400');
			expect(tes3.getColorHex()).toEqual('#cc0000');
		});

		it('Can check if TestExecutionStatus has "good" meaning', () => {
			expect(tes1.isPositive()).toEqual(false);
			expect(tes2.isPositive()).toEqual(true);
			expect(tes3.isPositive()).toEqual(false);
		});

		it('Can check if TestExecutionStatus has "neutral" meaning', () => {
			expect(tes1.isNeutral()).toEqual(true);
			expect(tes2.isNeutral()).toEqual(false);
			expect(tes3.isNeutral()).toEqual(false);
		});

		it('Can check if TestExecutionStatus has "bad" meaning', () => {
			expect(tes1.isNegative()).toEqual(false);
			expect(tes2.isNegative()).toEqual(false);
			expect(tes3.isNegative()).toEqual(true);
		});
	});

	describe('Basic Server Functions', () => {
		// get by id - 0 & 1 matches
		it('Can get TestExecutionStatus by single ID (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [stat1Vals]
			}));
			const result = await TestExecutionStatus.getById(1);
			expect(result).toEqual(tes1);
		});

		it('Can get TestExecutionStatus by single ID (no matches)', 
			async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: []
				}));
				expect(TestExecutionStatus.getById(1))
					.rejects
					.toThrowError(
						'Could not find any TestExecutionStatus with ID 1'
					);
			});

		it('Can get multiple TestExecutionStatus from array of IDs', 
			async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: [stat1Vals, stat2Vals]
				}));
				const results = await TestExecutionStatus.getByIds([1, 4]);
				expect(results).toEqual(expect.arrayContaining([tes1, tes2]));
				expect(results).not.toEqual(expect.arrayContaining([tes3]));
			});

		// get by name - 0 & 1 matches
		it('Can get TestExecutionStatus by name (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [stat1Vals]
			}));
			const result = await TestExecutionStatus.getByName('IDLE');
			expect(result).toEqual(tes1);
		});

		it('Can get TestExecutionStatus by name (no matches)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));
			const name = 'NON-EXISTENT-NAME';
			expect(TestExecutionStatus.getByName(name))
				.rejects
				.toThrowError(
					/* eslint-disable-next-line max-len */
					`TestExecutionStatus with name "${name}" could not be found.`
				);
		});
	});

	describe('Resolve TestExecutionStatus ID', () => {
		it('Can resolve ID from number', async () => {
			const stat1 = await TestExecutionStatus.resolveId(1);
			const stat5 = await TestExecutionStatus.resolveId(5);
			const stat42 = await TestExecutionStatus.resolveId(42);

			expect(stat1).toEqual(1);
			expect(stat5).toEqual(5);
			expect(stat42).toEqual(42);
		});

		it('Can resolve ID from TestExecutionStatus', async () => {
			const stat1 = new TestExecutionStatus(mockTestExecutionStatus({
				id: 1,
				name: 'one'
			}));
			const stat5 = new TestExecutionStatus(mockTestExecutionStatus({
				id: 5,
				name: 'five'
			}));
			const stat42 = new TestExecutionStatus(mockTestExecutionStatus({
				id: 42,
				name: 'forty-two'
			}));

			expect(await TestExecutionStatus.resolveId(stat1)).toEqual(1);
			expect(await TestExecutionStatus.resolveId(stat5)).toEqual(5);
			expect(await TestExecutionStatus.resolveId(stat42)).toEqual(42);
		});

		it('Can resolve ID from Name', async () => {
			const stat1 = 'one';
			const stat5 = 'five';
			const stat42 = 'fourty-two';

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTestExecutionStatus({
						id: 1,
						name: 'one'
					})
				]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTestExecutionStatus({
						id: 5,
						name: 'five'
					})
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTestExecutionStatus({
						id: 42,
						name: 'fourty-two'
					})
				]
			}));

			expect(await TestExecutionStatus.resolveId(stat1)).toEqual(1);
			expect(await TestExecutionStatus.resolveId(stat5)).toEqual(5);
			expect(await TestExecutionStatus.resolveId(stat42)).toEqual(42);
		});
	});
});
