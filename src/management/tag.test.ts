import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import Tag from './tag';
import { mockTag, mockTagServerEntry } from '../../test/mockKiwiValues';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Tag', () => {
	
	const tag1Vals = mockTag();
	const tag2Vals = mockTag({
		id: 2,
		name: 'SecondTag'
	});
	const tag3Vals = mockTag({
		id: 3,
		name: 'ThirdTag'
	});
	
	describe('Object Instantiation', () => {
		it('Can instantiate a Tag from local values', () => {
			const tag1 = new Tag(tag1Vals);
			const tag2 = new Tag(tag2Vals);
			const tag3 = new Tag(tag3Vals);
			expect(tag1['serialized']).toEqual(tag1Vals);
			expect(tag2['serialized']).toEqual(tag2Vals);
			expect(tag3['serialized']).toEqual(tag3Vals);
		});
		
		it('Can instantiate a Tag from Server-only values', () => {
			const tag1 = new Tag(mockTagServerEntry(tag1Vals));
			const tag2 = new Tag(mockTagServerEntry({
				...tag2Vals,
				case: 4
			}));
			const tag3 = new Tag(mockTagServerEntry({
				...tag3Vals,
				plan: 2
			}));
			expect(tag1).toEqual(new Tag(tag1Vals));
			expect(tag2).toEqual(new Tag(tag2Vals));
			expect(tag3).toEqual(new Tag(tag3Vals));
		});
	});
	
	
	describe('Access Local Properties', () => {
		const tag1 = new Tag(tag1Vals);
		const tag2 = new Tag(tag2Vals);
		const tag3 = new Tag(tag3Vals);
		
		it('Can get ID of Tag', () => {
			expect(tag1.getId()).toEqual(1);
			expect(tag2.getId()).toEqual(2);
			expect(tag3.getId()).toEqual(3);
		});
		
		it('Can get name of Tag', () => {
			expect(tag1.getName()).toEqual('ExampleTag');
			expect(tag2.getName()).toEqual('SecondTag');
			expect(tag3.getName()).toEqual('ThirdTag');
		});
	});
	
	describe('Server Lookups of Tags', () => {
		it('Can get single by ID', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry(tag1Vals),
					mockTagServerEntry({
						...tag1Vals,
						case: 1
					}),
					mockTagServerEntry({
						...tag1Vals,
						case: 2
					})
				]
			}));
			
			const tag1 = await Tag.getById(1);
			expect(tag1['serialized']).toEqual(tag1Vals);
		});
		
		it('Can get multiple by ID', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry(tag1Vals),
					mockTagServerEntry(tag2Vals),
					mockTagServerEntry({
						...tag1Vals,
						run: 1
					}),
					mockTagServerEntry({
						...tag2Vals,
						case: 3
					})
				]
			}));
			
			const tags = await Tag.getByIds([1, 2]);
			expect(tags).toHaveLength(2);
			expectArrayWithKiwiItem(tags, tag1Vals);
			expectArrayWithKiwiItem(tags, tag2Vals);
		});
		
		it('Can get Tag by name - 0 matches throws error', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			const name = 'UnusedName';
			expect(Tag.getByName(name))
				.rejects
				.toThrowError(`Tag with name '${name}' not found.`);
		});
		
		it('Can get Tag by name - 1 discrete match returns Tag', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ 
					mockTagServerEntry({
						...tag1Vals,
						case: 2
					})
				]
			}));
			const tag = await Tag.getByName('ExampleTag');
			expect(tag['serialized']).toEqual(tag1Vals);
		});
		
		it('Can get Tag by name - 1 unique match returns Tag', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry(tag1Vals),
					mockTagServerEntry({
						...tag1Vals,
						case: 1
					}),
					mockTagServerEntry({
						...tag1Vals,
						case: 3
					}),
					mockTagServerEntry({
						...tag1Vals,
						case: 4
					}),
					mockTagServerEntry({
						...tag1Vals,
						plan: 3
					}),
					mockTagServerEntry({
						...tag1Vals,
						run: 7
					}),
				]
			}));
			const tag = await Tag.getByName('ExampleTag');
			expect(tag['serialized']).toEqual(tag1Vals);
		});
		
		it('Can get Tag by name - multiple matches throws error', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry(tag1Vals),
					mockTagServerEntry({
						...tag1Vals,
						...tag3Vals,
						name: 'ExampleTag'
					})
				]
			}));
			expect(Tag.getByName('ExampleTag'))
				.rejects
				.toThrowError(
					'Attempted to get Tag with non-unique name \'ExampleTag\''
				);
		});
	});
	
	describe('Server Lookups of Associated Objects', () => {
		it('Can get IDs of TestCases with Tag - Multiple matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry({ ...tag1Vals, case: 2 }),
					mockTagServerEntry({ ...tag1Vals, case: 4 }),
					mockTagServerEntry({ ...tag1Vals, case: 5 }),
					mockTagServerEntry({ ...tag1Vals, case: 10 }),
					mockTagServerEntry({ ...tag1Vals, case: 23 }),
				]
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestCaseIds();
			
			expect(caseIds).toHaveLength(5);
			expect(caseIds).toEqual([2, 4, 5, 10, 23]);
		});
		
		it('Can get IDs of TestCases with Tag - 0 matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestCaseIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
		
		it('Can get IDs of TestPlans with Tag - Multiple matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry({
						...tag1Vals,
						plan: 2
					}),
					mockTagServerEntry({
						...tag1Vals,
						plan: 4
					}),
					mockTagServerEntry({
						...tag1Vals,
						plan: 5
					}),
					mockTagServerEntry({
						...tag1Vals,
						plan: 10
					}),
					mockTagServerEntry({
						...tag1Vals,
						plan: 23
					}),
				]
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestPlanIds();
			
			expect(caseIds).toHaveLength(5);
			expect(caseIds).toEqual([2, 4, 5, 10, 23]);
		});
		
		it('Can get IDs of TestPlans with Tag - 0 matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestPlanIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
		
		it('Can get IDs of TestRuns with Tag - Multiple matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry({
						...tag1Vals,
						run: 2
					}),
					mockTagServerEntry({
						...tag1Vals,
						run: 4
					}),
					mockTagServerEntry({
						...tag1Vals,
						run: 5
					}),
					mockTagServerEntry({
						...tag1Vals,
						run: 10
					}),
					mockTagServerEntry({
						...tag1Vals,
						run: 23
					}),
				]
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestRunIds();
			
			expect(caseIds).toHaveLength(5);
			expect(caseIds).toEqual([2, 4, 5, 10, 23]);
		});
		
		it('Can get IDs of TestRuns with Tag - 0 matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestRunIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
		
		it('Can get IDs of Bugs with Tag - Multiple matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTagServerEntry({
						...tag1Vals,
						bugs: 2
					}),
					mockTagServerEntry({
						...tag1Vals,
						bugs: 4
					}),
					mockTagServerEntry({
						...tag1Vals,
						bugs: 5
					}),
					mockTagServerEntry({
						...tag1Vals,
						bugs: 10
					}),
					mockTagServerEntry({
						...tag1Vals,
						bugs: 23
					}),
				]
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedBugIds();
			
			expect(caseIds).toHaveLength(5);
			expect(caseIds).toEqual([2, 4, 5, 10, 23]);
		});
		
		it('Can get IDs of Bugs with Tag - 0 matches', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedBugIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
	});
});