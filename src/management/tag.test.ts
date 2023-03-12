import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import Tag from './tag';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Tag', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const tag1Base = { id: 1, name: 'FirstTag' };
	const tag2Base = { id: 2, name: 'SecondTag' };
	const tag3Base = { id: 3, name: 'FirstTag' };
	
	it('Can get single by ID', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse(
				{ 
					result: [
						{ 
							...tag1Base, 
							'case': null, 
							plan: null, 
							run: null, 
							bugs: null 
						},
						{ 
							...tag1Base, 
							'case': 1, 
							plan: null, 
							run: null, 
							bugs: null 
						},
						{ 
							...tag1Base, 
							'case': 2, 
							plan: null, 
							run: null, 
							bugs: null 
						}
					] 
				}));
		
		const tag1 = await Tag.getById(1);
		expect(tag1['serialized']).toEqual(tag1Base);
	});
	
	it('Can get multiple by ID', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse(
				{ 
					result: [
						{ 
							...tag1Base, 
							'case': null, 
							plan: null, 
							run: null, 
							bugs: null 
						},
						{ 
							...tag1Base, 
							'case': 1, 
							plan: null, 
							run: null, 
							bugs: null 
						},
						{ 
							...tag1Base, 
							'case': 2, 
							plan: null, 
							run: null, 
							bugs: null 
						},
						{ 
							...tag2Base, 
							'case': 1, 
							plan: null, 
							run: null, 
							bugs: null 
						},
						{ 
							...tag2Base, 
							'case': null, 
							plan: 2, 
							run: null, 
							bugs: null 
						}
					] 
				}));
		
		const tags = await Tag.getByIds([1, 2]);
		expect(tags).toHaveLength(2);
		expectArrayWithKiwiItem(tags, tag1Base);
		expectArrayWithKiwiItem(tags, tag2Base);
	});
	
	it('Can get ID of Tag', () => {
		const tag = new Tag(tag1Base);
		expect(tag.getId()).toEqual(1);
	});
	
	it('Can get name of Tag', () => {
		const tag = new Tag(tag1Base);
		expect(tag.getName()).toEqual('FirstTag');
	});
	
	it('Can get Tag by name - 0 matches throws error', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
		const name = 'UnusedName';
		expect(Tag.getByName(name))
			.rejects
			.toThrowError(`Tag with name '${name}' not found.`);
	});
	
	it('Can get Tag by name - 1 discrete match returns Tag', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': 2, plan: null, run: null, bugs: null }
		] }));
		const name = 'FirstTag';
		const tag = await Tag.getByName(name);
		expect(tag['serialized']).toEqual(tag1Base);
	});
	
	it('Can get Tag by name - 1 unique match returns Tag', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': 2, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': 4, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': 5, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': null, plan: null, run: 3, bugs: null },
			{ ...tag1Base, 'case': null, plan: 1, run: null, bugs: null }
		] }));
		const name = 'FirstTag';
		const tag = await Tag.getByName(name);
		expect(tag['serialized']).toEqual(tag1Base);
	});
	
	it('Can get Tag by name - multiple matches throws error', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': null, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': null, plan: null, run: 1, bugs: null },
			{ ...tag3Base, 'case': null, plan: null, run: null, bugs: null }
		] }));
		const name = 'FirstTag';
		expect(Tag.getByName(name))
			.rejects
			.toThrowError(
				`Attempted to get Tag with non-unique name '${name}'`
			);
	});
	
	it('Can get IDs of TestCases with Tag - Multiple matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': 2, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': 4, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': 5, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': 10, plan: null, run: null, bugs: null },
			{ ...tag1Base, 'case': 23, plan: null, run: null, bugs: null }
		] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedTestCaseIds();
		
		expect(caseIds).toHaveLength(5);
		expect(caseIds).toEqual([2, 4, 5, 10, 23]);
	});
	
	it('Can get IDs of TestCases with Tag - 0 matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedTestCaseIds();
		
		expect(caseIds).toHaveLength(0);
		expect(caseIds).toEqual([]);
	});
	
	it('Can get IDs of TestPlans with Tag - Multiple matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': null, plan: 2, run: null, bugs: null },
			{ ...tag1Base, 'case': null, plan: 4, run: null, bugs: null },
			{ ...tag1Base, 'case': null, plan: 5, run: null, bugs: null },
			{ ...tag1Base, 'case': null, plan: 10, run: null, bugs: null },
			{ ...tag1Base, 'case': null, plan: 23, run: null, bugs: null }
		] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedTestPlanIds();
		
		expect(caseIds).toHaveLength(5);
		expect(caseIds).toEqual([2, 4, 5, 10, 23]);
	});
	
	it('Can get IDs of TestPlans with Tag - 0 matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedTestPlanIds();
		
		expect(caseIds).toHaveLength(0);
		expect(caseIds).toEqual([]);
	});
	
	it('Can get IDs of TestRuns with Tag - Multiple matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': null, plan: null, run: 2, bugs: null },
			{ ...tag1Base, 'case': null, plan: null, run: 4, bugs: null },
			{ ...tag1Base, 'case': null, plan: null, run: 5, bugs: null },
			{ ...tag1Base, 'case': null, plan: null, run: 10, bugs: null },
			{ ...tag1Base, 'case': null, plan: null, run: 23, bugs: null }
		] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedTestRunIds();
		
		expect(caseIds).toHaveLength(5);
		expect(caseIds).toEqual([2, 4, 5, 10, 23]);
	});
	
	it('Can get IDs of TestRuns with Tag - 0 matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedTestRunIds();
		
		expect(caseIds).toHaveLength(0);
		expect(caseIds).toEqual([]);
	});
	
	it('Can get IDs of Bugs with Tag - Multiple matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [
			{ ...tag1Base, 'case': null, plan: null, run: null, bugs: 2 },
			{ ...tag1Base, 'case': null, plan: null, run: null, bugs: 4 },
			{ ...tag1Base, 'case': null, plan: null, run: null, bugs: 5 },
			{ ...tag1Base, 'case': null, plan: null, run: null, bugs: 10 },
			{ ...tag1Base, 'case': null, plan: null, run: null, bugs: 23 }
		] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedBugIds();
		
		expect(caseIds).toHaveLength(5);
		expect(caseIds).toEqual([2, 4, 5, 10, 23]);
	});
	
	it('Can get IDs of Bugs with Tag - 0 matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
		
		const tag = new Tag(tag1Base);
		const caseIds = await tag.getTaggedBugIds();
		
		expect(caseIds).toHaveLength(0);
		expect(caseIds).toEqual([]);
	});
	
});