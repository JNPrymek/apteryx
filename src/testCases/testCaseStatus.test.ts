import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

import TestCaseStatus from './testCaseStatus';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Case Status', () => {

	const stat1Vals = {
		id: 1,
		name: 'PROPOSED',
		description: 'Test case is pending approval',
		'is_confirmed': false
	};
	const stat2Vals = {
		id: 2,
		name: 'CONFIRMED',
		description: 'Test case is fully approved and usable',
		'is_confirmed': true
	};

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
			expect(stat1.getDescription()).toEqual('Test case is pending approval');
			expect(stat2.getDescription()).toEqual('Test case is fully approved and usable');
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
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [stat1Vals]}));
			const result = await TestCaseStatus.getById(1);
			expect(result).toEqual(stat1);
		});	
		
		it('Can get TestCaseStatus by single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			expect(TestCaseStatus.getById(1)).rejects.toThrowError('Could not find any TestCaseStatus with ID 1');
		});

		it('Can get TestCaseStatus by Name (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [stat1Vals]}));
			const result = await TestCaseStatus.getByName('PROPOSED');
			expect(result).toEqual(stat1);
		});

		it('Can get TestCaseStatus by Name (0 matches)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			const name = 'Non-used name';
			expect(TestCaseStatus.getByName(name)).rejects.toThrowError(`TestCaseStatus with name "${name}" could not be found.`);
		});
	});
	
});
