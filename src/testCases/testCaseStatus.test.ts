import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import { mockTestCaseStatus } from '../../test/mockKiwiValues';

import TestCaseStatus from './testCaseStatus';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Case Status', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const stat1Vals = mockTestCaseStatus();
	const stat2Vals = mockTestCaseStatus({
		id: 2,
		name: 'CONFIRMED',
		description: 'Test case is fully approved and usable',
		'is_confirmed': true
	});

	it('Can instantiate a TestCaseStatus', () => {
		const stat1 = new TestCaseStatus(stat1Vals);
		const stat2 = new TestCaseStatus(stat2Vals);

		expect(stat1['serialized']).toEqual(stat1Vals);
		expect(stat2['serialized']).toEqual(stat2Vals);
	});

	describe('Can access local properties', () => {
		const stat1 = new TestCaseStatus(stat1Vals);
		const stat2 = new TestCaseStatus(stat2Vals);

		it('Can get TestCase Status ID', () => {
			expect(stat1.getId()).toEqual(1);
			expect(stat2.getId()).toEqual(2);
		});

		it('Can get TestCase Status Name', () => {
			expect(stat1.getName()).toEqual('PROPOSED');
			expect(stat2.getName()).toEqual('CONFIRMED');
		});

		it('Can get TestCase Status Description', () => {
			expect(stat1.getDescription())
				.toEqual('Test case is pending approval');
			expect(stat2.getDescription())
				.toEqual('Test case is fully approved and usable');
		});

		it('Can get if TestCase Status is confirmed', () => {
			expect(stat1.isConfirmed()).toEqual(false);
			expect(stat2.isConfirmed()).toEqual(true);
		});

		it('Can get if TestCase Status is runnable', () => {
			expect(stat1.isRunnable()).toEqual(false);
			expect(stat2.isRunnable()).toEqual(true);
		});
	});

	describe('Basic Server Function', () => {
		const stat1 = new TestCaseStatus(stat1Vals);

		it('Can get TestCaseStatus by a single ID (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [stat1Vals] 
			}));
			const result = await TestCaseStatus.getById(1);
			expect(result).toEqual(stat1);
		});	
		
		it('Can get TestCaseStatus by single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [] 
			}));
			expect(TestCaseStatus.getById(1))
				.rejects
				.toThrowError('Could not find any TestCaseStatus with ID 1');
		});

		it('Can get TestCaseStatus by Name (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [stat1Vals] 
			}));
			const result = await TestCaseStatus.getByName('PROPOSED');
			expect(result).toEqual(stat1);
		});

		it('Can get TestCaseStatus by Name (0 matches)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			const name = 'Non-used name';
			expect(TestCaseStatus.getByName(name))
				.rejects
				.toThrowError(
					`TestCaseStatus with name "${name}" could not be found.`
				);
		});

		it('Can resolve TestCaseStatus ID by id', () => {
			expect(TestCaseStatus.resolveStatusId(1)).resolves.toEqual(1);
			expect(TestCaseStatus.resolveStatusId(82)).resolves.toEqual(82);
			expect(TestCaseStatus.resolveStatusId(5)).resolves.toEqual(5);
			expect(TestCaseStatus.resolveStatusId(314)).resolves.toEqual(314);
		});

		it('Can resolve TestCaseStatus ID from TestCaseStatus object', () => {
			const tcs1 = new TestCaseStatus(mockTestCaseStatus({ id: 1 }));
			const tcs2 = new TestCaseStatus(mockTestCaseStatus({ id: 57 }));
			const tcs3 = new TestCaseStatus(mockTestCaseStatus({ id: 34 }));
			const tcs4 = new TestCaseStatus(mockTestCaseStatus({ id: 963 }));

			expect(TestCaseStatus.resolveStatusId(tcs1)).resolves.toEqual(1);
			expect(TestCaseStatus.resolveStatusId(tcs2)).resolves.toEqual(57);
			expect(TestCaseStatus.resolveStatusId(tcs3)).resolves.toEqual(34);
			expect(TestCaseStatus.resolveStatusId(tcs4)).resolves.toEqual(963);
		});

		it('Can resolve TestCaseStatus ID from Name', async () => {
			const stat1Vals = mockTestCaseStatus({
				name: 'First Status'
			});
			const stat2Vals = mockTestCaseStatus({
				id: 2,
				name: 'Second Status'
			});

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [stat1Vals]
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [stat2Vals]
			}));

			expect(await TestCaseStatus.resolveStatusId('First Status'))
				.toEqual(1);
			expect(await TestCaseStatus.resolveStatusId('Second Status'))
				.toEqual(2);

			verifyRpcCall(
				mockAxios,
				0,
				'TestCaseStatus.filter',
				[{ name: 'First Status' }]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestCaseStatus.filter',
				[{ name: 'Second Status' }]
			);
		});
	});
	
});
