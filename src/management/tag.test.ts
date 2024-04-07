import { describe, it, expect } from '@jest/globals';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import Tag from './tag';
import { mockTag, mockTagServerEntry } from '../../test/mockKiwiValues';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import {
	assertPostRequestData
} from '../../test/networkMocks/assertPostRequestData';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Tag', () => {
	
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			const name = 'UnusedName';
			expect(Tag.getByName(name))
				.rejects
				.toThrowError(`Tag with name '${name}' not found.`);
		});
		
		it('Can get Tag by name - 1 discrete match returns Tag', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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

	describe('Tag Name resolution', () => {
		it('Can resolve Tag name from string - returns input', async () => {
			const name = await Tag.resolveToTagName('tag name');
			expect(name).toEqual('tag name');
			expect(mockPostRequest).not.toBeCalled();
		});

		it('Can resolve Tag name from Tag object', async () => {
			const tag = new Tag(mockTag({ name: 'ExampleTag' }));
			const name = await Tag.resolveToTagName(tag);
			expect(name).toEqual('ExampleTag');
			expect(mockPostRequest).not.toBeCalled();
		});

		it('Can resolve Tag name from ID - uses Tag lookup', async () => {
			const id = 4;
			const tagVal = mockTagServerEntry({ id: 4, name: 'ExampleTag4' });

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ tagVal ]
			}));
			const name = await Tag.resolveToTagName(id);

			expect(name).toEqual('ExampleTag4');
			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'Tag.filter',
				params: [{ id__in: [ id ] }],
			});
		});
	});
	
	describe('Server Lookups of Associated Objects', () => {
		it('Can get IDs of TestCases with Tag - Multiple matches', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestCaseIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
		
		it('Can get IDs of TestPlans with Tag - Multiple matches', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));

			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestPlanIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
		
		it('Can get IDs of TestRuns with Tag - Multiple matches', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedTestRunIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});
		
		it('Can get IDs of Bugs with Tag - Multiple matches', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));
			
			const tag = new Tag(tag1Vals);
			const caseIds = await tag.getTaggedBugIds();
			
			expect(caseIds).toHaveLength(0);
			expect(caseIds).toEqual([]);
		});

		it('Can get Tags for given TestCase ID', async () => {
			const tcId = 35;
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ ...tag1Vals, case: tcId }),
					mockTagServerEntry({ ...tag2Vals, case: tcId }),
					mockTagServerEntry({ ...tag3Vals, case: tcId }),
				]
			}));

			const tagList = await Tag.getTagsForTestCase(tcId);
			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ case: tcId }],
			});

			expect(tagList).toContainEqual(new Tag(tag1Vals));
			expect(tagList).toContainEqual(new Tag(tag2Vals));
			expect(tagList).toContainEqual(new Tag(tag3Vals));
		});

		it('Can get Tags for given TestPlan ID', async () => {
			const planId = 35;
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ ...tag1Vals, plan: planId }),
					mockTagServerEntry({ ...tag2Vals, plan: planId }),
					mockTagServerEntry({ ...tag3Vals, plan: planId }),
				]
			}));

			const tagList = await Tag.getTagsForTestPlan(planId);
			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ plan: planId }],
			});

			expect(tagList).toContainEqual(new Tag(tag1Vals));
			expect(tagList).toContainEqual(new Tag(tag2Vals));
			expect(tagList).toContainEqual(new Tag(tag3Vals));
		});

		it('Can get Tags for given TestRun ID', async () => {
			const runId = 35;
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ ...tag1Vals, run: runId }),
					mockTagServerEntry({ ...tag2Vals, run: runId }),
					mockTagServerEntry({ ...tag3Vals, run: runId }),
				]
			}));

			const tagList = await Tag.getTagsForTestRun(runId);
			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ run: runId }],
			});

			expect(tagList).toContainEqual(new Tag(tag1Vals));
			expect(tagList).toContainEqual(new Tag(tag2Vals));
			expect(tagList).toContainEqual(new Tag(tag3Vals));
		});
	});

	describe('Updating Tag objects', () => {
		it('Can resync local values with server values', async () => {
			const origLocalVal = mockTag();
			const origServerVal = mockTagServerEntry(origLocalVal);
			const updatedLocalVal = mockTag({ name: 'New name' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [ origServerVal ]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry(updatedLocalVal),
					mockTagServerEntry({
						...updatedLocalVal,
						case: 1
					}),
					mockTagServerEntry({
						...updatedLocalVal,
						case: 2
					}),
					mockTagServerEntry({
						...updatedLocalVal,
						run: 1
					})
				]
			}));
			
			const tag1 = await Tag.getById(1);
			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ id__in: [1] }],
			});
			expect(tag1['serialized']).toEqual(origLocalVal);

			await tag1.syncServerValues();
			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ id: 1 }],
				callIndex: 1,
			});
			expect(tag1['serialized']).toEqual(updatedLocalVal);
		});
	});
});
