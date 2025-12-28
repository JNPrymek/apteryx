import { describe, expect, it } from '@jest/globals';
import { assertPostRequestData } from '../../test/networkMocks/assertPostRequestData';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import RequestHandler from '../core/requestHandler';

import {
	mockComponent,
	mockComponentServerEntry,
	mockPriority,
	mockTag,
	mockTagServerEntry,
	mockTestCase,
	mockTestCaseStatus,
	mockUser,
} from '../../test/mockKiwiValues';
import { mockTestCaseComment } from '../../test/mockValues/comments/mockComment';
import { mockTestCaseProperty, mockTestCaseUpdateResponse } from '../../test/mockValues/testCases/mockTestCaseValues';
import Comment from '../comments/comment';
import Component from '../management/component';
import Priority from '../management/priority';
import Tag from '../management/tag';
import User from '../management/user';
import Category from './category';
import TestCase from './testCase';
import { TestCaseCreateValues, TestCaseWriteValues } from './testCase.type';
import TestCaseProperty from './testCaseProperty';
import { TestCasePropertyValues } from './testCaseProperty.type';
import TestCaseStatus from './testCaseStatus';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest = RequestHandler.sendPostRequest as jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('TestCase', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const case1Vals = mockTestCase();
	const case2Vals = mockTestCase({
		id: 2,
		summary: 'Another test case',
		extra_link: 'Sample text or an empty string',
		script: '',
		default_tester: null,
		default_tester__username: null,
		reviewer: 3,
		reviewer__username: 'charles',
		is_automated: true,
		setup_duration: 0.0,
		testing_duration: 325.0,
		expected_duration: 325.0,
	});

	it('Can instantiate a TestCase', () => {
		const tc1 = new TestCase(case1Vals);
		expect(tc1['serialized']).toEqual(case1Vals);
	});

	describe('Can access local properties of TestCase', () => {
		const tc1 = new TestCase(case1Vals);
		const tc2 = new TestCase(case2Vals);

		it('Can get TC ID', () => {
			expect(tc1.getId()).toEqual(1);
			expect(tc2.getId()).toEqual(2);
		});

		it('Can get TC Create Date', () => {
			const date = new Date('2022-12-02T20:13:27.697Z');
			expect(tc1.getCreateDate()).toEqual(date);
		});

		it('Can get TC Automation (automated)', () => {
			expect(tc1.isAutomated()).toEqual(false);
			expect(tc2.isAutomated()).toEqual(true);
		});

		it('Can get TC Automation (manual)', () => {
			expect(tc1.isManual()).toEqual(true);
			expect(tc2.isManual()).toEqual(false);
		});

		it('Can get TC Script', () => {
			expect(tc1.getScript()).toEqual('Sample script or an empty string');
			expect(tc2.getScript()).toEqual('');
		});

		it('Can get TC Arguments', () => {
			expect(tc1.getArguments())
				.toEqual('Sample args or an empty string');
		});

		it('Can get TC Requirements', () => {
			expect(tc1.getRequirements()).toBeNull();
		});

		it('Can get TC Extra Link', () => {
			expect(tc1.getExtraLink()).toBeNull();
			expect(tc2.getExtraLink())
				.toEqual('Sample text or an empty string');
		});

		it('Can get TC Reference Link', () => {
			expect(tc1.getReferenceLink()).toBeNull();
			expect(tc2.getReferenceLink())
				.toEqual('Sample text or an empty string');
		});

		it('Can get TC Summary', () => {
			expect(tc1.getSummary()).toEqual('Example Test Case Title');
			expect(tc2.getSummary()).toEqual('Another test case');
		});

		it('Can get TC Title', () => {
			expect(tc1.getTitle()).toEqual('Example Test Case Title');
			expect(tc2.getTitle()).toEqual('Another test case');
		});

		it('Can get TC Text', () => {
			expect(tc1.getText())
				.toEqual('An example test case for unit testing');
		});

		it('Can get TC Description', () => {
			expect(tc1.getDescription())
				.toEqual('An example test case for unit testing');
		});

		it('Can get TC Notes', () => {
			expect(tc1.getNotes()).toEqual('Custom notes go here');
		});

		it('Can get TC Status', async () => {
			const tcStatus2Vals = mockTestCaseStatus({
				id: 2,
				name: 'CONFIRMED',
				is_confirmed: true,
				description: 'Tests that are ready to go',
			});
			const confirmedStatus = new TestCaseStatus(tcStatus2Vals);
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [tcStatus2Vals],
			}));

			const tc1Status = await tc1.getCaseStatus();
			expect(tc1Status).toEqual(confirmedStatus);
		});

		it('Can get TC Status ID', () => {
			expect(tc1.getCaseStatusId()).toEqual(2);
		});

		it('Can get TC Status Name', () => {
			expect(tc1.getCaseStatusName()).toEqual('CONFIRMED');
		});

		it('Can get TC Category ID', () => {
			expect(tc1.getCategoryId()).toEqual(4);
		});

		it('Can get TC Category Name', () => {
			expect(tc1.getCategoryName()).toEqual('Regression');
		});

		it('Can get TC Category', async () => {
			const regressionCategoryVals = mockTestCaseStatus({
				id: 4,
				name: 'Regression',
			});
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [regressionCategoryVals],
			}));
			const regressionCategory = await tc1.getCategory();
			expect(regressionCategory)
				.toEqual(new Category(regressionCategoryVals));
		});

		it('Can get TC Priority', async () => {
			const priority1Vals = mockPriority();
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [priority1Vals],
			}));
			const tcPriority = await tc1.getPriority();
			expect(tcPriority).toEqual(new Priority(priority1Vals));
		});

		it('Can get TC Priority ID', () => {
			expect(tc1.getPriorityId()).toEqual(1);
		});

		it('Can get TC Priority Value', () => {
			expect(tc1.getPriorityValue()).toEqual('P1');
		});

		it('Can get TC Author ID', () => {
			expect(tc1.getAuthorId()).toEqual(1);
			expect(tc2.getAuthorId()).toEqual(1);
		});

		it('Can get TC Author Username', () => {
			expect(tc1.getAuthorName()).toEqual('alice');
			expect(tc2.getAuthorName()).toEqual('alice');
		});

		it('Can get TC Author', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [mockUser()],
			}));
			expect(await tc1.getAuthor()).toEqual(new User(mockUser()));
		});

		it('Can get TC Reviewer ID', () => {
			expect(tc1.getReviewerId()).toEqual(2);
			expect(tc2.getReviewerId()).toEqual(3);
		});

		it('Can get TC Reviewer Username', () => {
			expect(tc1.getReviewerName()).toEqual('bob');
			expect(tc2.getReviewerName()).toEqual('charles');
		});

		it('Can get TC Reviewer', async () => {
			const userVals = mockUser({
				id: 2,
				username: 'bob',
				email: 'bob@example.com',
				first_name: 'Bob',
				last_name: 'Bar',
			});
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [userVals],
			}));
			expect(await tc1.getReviewer()).toEqual(new User(userVals));
		});

		it('Can get TC Default Tester ID', () => {
			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc2.getDefaultTesterId()).toBeNull();
		});

		it('Can get TC Default Tester Username', () => {
			expect(tc1.getDefaultTesterName()).toEqual('alice');
			expect(tc2.getDefaultTesterName()).toBeNull();
		});

		it('Can get TC Default Tester', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [mockUser()],
			}));
			expect(await tc1.getDefaultTester()).toEqual(new User(mockUser()));
		});

		it('Can get TC Setup Duration', () => {
			expect(tc1.getSetupDuration()).toEqual(60.0);
			expect(tc2.getSetupDuration()).toEqual(0.0);
		});

		it('Can get TC Testing Duration', () => {
			expect(tc1.getTestingDuration()).toEqual(30.0);
			expect(tc2.getTestingDuration()).toEqual(325.0);
		});

		it('Can get TC Total Expected Duration', () => {
			expect(tc1.getTotalDuration()).toEqual(90.0);
			expect(tc2.getTotalDuration()).toEqual(325.0);
		});
	});

	describe('Basic Server Functions', () => {
		it('Can get TC by a single ID (one match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [case1Vals],
			}));
			const testCaseOne = await TestCase.getById(1);
			expect(testCaseOne).toEqual(new TestCase(case1Vals));
		});

		it('Can get TC by a single ID (no match)', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			expect(TestCase.getById(1)).rejects.toThrow(
				'Could not find any TestCase with ID 1',
			);
		});
	});

	describe('Relational data', () => {
		it('Can get Tags linked to a TestCase - 1+ result', async () => {
			const tc1 = new TestCase(mockTestCase());

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ id: 2, name: 'Tag2', case: 1 }),
					mockTagServerEntry({ id: 3, name: 'Tag3', case: 1 }),
					mockTagServerEntry({ id: 4, name: 'Tag4', case: 1 }),
				],
			}));

			const tags = await tc1.getTags();

			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ case: 1 }],
			});

			expect(tags).toContainEqual(new Tag({ id: 2, name: 'Tag2' }));
			expect(tags).toContainEqual(new Tag({ id: 3, name: 'Tag3' }));
			expect(tags).toContainEqual(new Tag({ id: 4, name: 'Tag4' }));
		});

		it('Can get Tags linked to a TestCase - 0 results', async () => {
			const tc1 = new TestCase(mockTestCase());

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));

			const tags = await tc1.getTags();

			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ case: 1 }],
			});

			expect(tags.length).toEqual(0);
		});

		it('Can get Components linked to TestCase - 1+ result', async () => {
			const tcId = 8;
			const tc8 = new TestCase(mockTestCase({ id: 8 }));

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockComponentServerEntry({ name: 'Comp1', cases: tcId }),
					mockComponentServerEntry(
						{ id: 8, name: 'Comp8', cases: tcId },
					),
					mockComponentServerEntry(
						{ id: 14, name: 'Comp14', cases: tcId },
					),
				],
			}));

			const compoents = await tc8.getComponents();

			assertPostRequestData({
				mockPostRequest,
				method: 'Component.filter',
				params: [{ cases: tcId }],
			});

			expect(compoents)
				.toContainEqual(
					new Component(
						mockComponent({ id: 1, name: 'Comp1' }),
					),
				);
			expect(compoents)
				.toContainEqual(
					new Component(
						mockComponent({ id: 8, name: 'Comp8' }),
					),
				);
			expect(compoents)
				.toContainEqual(
					new Component(
						mockComponent({ id: 14, name: 'Comp14' }),
					),
				);
		});

		it('Can get Components linked to TestCase - 0 results', async () => {
			const tcId = 8;
			const tc8 = new TestCase(mockTestCase({ id: 8 }));

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));

			const compoents = await tc8.getComponents();

			assertPostRequestData({
				mockPostRequest,
				method: 'Component.filter',
				params: [{ cases: tcId }],
			});

			expect(compoents.length).toEqual(0);
		});

		it('Can get TestCases from Component', async () => {
			const comp = new Component(mockComponent());
			const compVals = [
				mockComponentServerEntry({ cases: 1 }),
				mockComponentServerEntry({ cases: 2 }),
				mockComponentServerEntry({ cases: 3 }),
			];
			const tcVals = [
				mockTestCase({ id: 1, summary: 'TC1' }),
				mockTestCase({ id: 2, summary: 'TC2' }),
				mockTestCase({ id: 3, summary: 'TC3' }),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: compVals,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: tcVals,
			}));

			const tcList = await TestCase.getTestCasesWithComponent(comp);
			expect(tcList).toContainEqual(new TestCase(tcVals[0]));
			expect(tcList).toContainEqual(new TestCase(tcVals[1]));
			expect(tcList).toContainEqual(new TestCase(tcVals[2]));
		});

		it('Can get TestCases from Component ID', async () => {
			const compVals = [
				mockComponentServerEntry({ cases: 1 }),
				mockComponentServerEntry({ cases: 2 }),
				mockComponentServerEntry({ cases: 3 }),
			];
			const tcVals = [
				mockTestCase({ id: 1, summary: 'TC1' }),
				mockTestCase({ id: 2, summary: 'TC2' }),
				mockTestCase({ id: 3, summary: 'TC3' }),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: compVals,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: tcVals,
			}));

			const tcList = await TestCase.getTestCasesWithComponent(1);
			expect(tcList).toContainEqual(new TestCase(tcVals[0]));
			expect(tcList).toContainEqual(new TestCase(tcVals[1]));
			expect(tcList).toContainEqual(new TestCase(tcVals[2]));
		});

		it('Can get TestCases from Tag', async () => {
			const tag1 = new Tag(mockTag());
			const tagVals = [
				mockTagServerEntry({ case: 1 }),
				mockTagServerEntry({ case: 2 }),
				mockTagServerEntry({ case: 3 }),
			];
			const tcVals = [
				mockTestCase({ id: 1, summary: 'TC1' }),
				mockTestCase({ id: 2, summary: 'TC2' }),
				mockTestCase({ id: 3, summary: 'TC3' }),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: tagVals,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: tcVals,
			}));

			const tcList = await TestCase.getTestCasesWithTag(tag1);
			expect(tcList).toContainEqual(new TestCase(tcVals[0]));
			expect(tcList).toContainEqual(new TestCase(tcVals[1]));
			expect(tcList).toContainEqual(new TestCase(tcVals[2]));
		});

		it('Can get TestCases from Tag ID', async () => {
			const tagVals = [
				mockTagServerEntry({ case: 1 }),
				mockTagServerEntry({ case: 2 }),
				mockTagServerEntry({ case: 3 }),
			];
			const tcVals = [
				mockTestCase({ id: 1, summary: 'TC1' }),
				mockTestCase({ id: 2, summary: 'TC2' }),
				mockTestCase({ id: 3, summary: 'TC3' }),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: tagVals,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: tcVals,
			}));

			const tcList = await TestCase.getTestCasesWithTag(1);
			expect(tcList).toContainEqual(new TestCase(tcVals[0]));
			expect(tcList).toContainEqual(new TestCase(tcVals[1]));
			expect(tcList).toContainEqual(new TestCase(tcVals[2]));
		});

		it('Can get TestCases from Tag Name', async () => {
			const tagVals = [
				mockTagServerEntry({ name: 'TestTag', case: 1 }),
				mockTagServerEntry({ name: 'TestTag', case: 2 }),
				mockTagServerEntry({ name: 'TestTag', case: 3 }),
			];
			const tcVals = [
				mockTestCase({ id: 1, summary: 'TC1' }),
				mockTestCase({ id: 2, summary: 'TC2' }),
				mockTestCase({ id: 3, summary: 'TC3' }),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: tagVals,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: tcVals,
			}));

			const tcList = await TestCase.getTestCasesWithTag('TestTag');
			expect(tcList).toContainEqual(new TestCase(tcVals[0]));
			expect(tcList).toContainEqual(new TestCase(tcVals[1]));
			expect(tcList).toContainEqual(new TestCase(tcVals[2]));
		});

		it('Can fetch Properties for TestCase', async () => {
			const propVals: Array<TestCasePropertyValues> = [
				mockTestCaseProperty(),
				mockTestCaseProperty({
					id: 2,
					name: 'fizz',
					value: 'buzz',
				}),
			];
			const props = [
				new TestCaseProperty(propVals[0]),
				new TestCaseProperty(propVals[1]),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: propVals,
			}));

			const tc1 = new TestCase(case1Vals);

			const results = await tc1.getProperties();

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.properties',
				params: [{ case: 1 }],
			});

			expect(results).toEqual(props);
		});

		it('Can fetch property values for TestCase', async () => {
			const propVals: Array<TestCasePropertyValues> = [
				mockTestCaseProperty(), // foo=bar
				mockTestCaseProperty({
					id: 2,
					name: 'fizz',
					value: 'buzz',
				}),
				mockTestCaseProperty({
					id: 3,
					name: 'foo',
					value: 'foo2',
				}),
			];
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [propVals[0], propVals[2]],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [propVals[1]],
			}));
			const tc1 = new TestCase(mockTestCase());
			expect(await tc1.getPropertyValues('foo'))
				.toEqual(['bar', 'foo2']);
			expect(await tc1.getPropertyValues('fizz')).toEqual(['buzz']);
		});

		it('Can fetch property names for TestCase', async () => {
			const propVals: Array<TestCasePropertyValues> = [
				mockTestCaseProperty(), // foo=bar
				mockTestCaseProperty({
					id: 2,
					name: 'fizz',
					value: 'buzz',
				}),
				mockTestCaseProperty({
					id: 3,
					name: 'foo',
					value: 'foo2',
				}),
			];
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: propVals,
			}));
			const tc1 = new TestCase(mockTestCase());
			expect(await tc1.getPropertyKeys()).toEqual(['foo', 'fizz']);
		});

		it('Can get Comments for a TestCase', async () => {
			const commentVal = mockTestCaseComment();
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [commentVal],
			}));
			const tc1 = new TestCase(mockTestCase());
			expect(await tc1.getComments()).toEqual([new Comment(commentVal)]);
		});
	});

	describe('Updating TestCase values', () => {
		it('Can sync local and server values', async () => {
			const origVal = mockTestCase();
			const updatedVal = mockTestCase({
				summary: 'New summary',
				text: 'New description',
				setup_duration: 200,
				testing_duration: 20,
				expected_duration: 220,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [origVal],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updatedVal],
			}));

			const tc1 = await TestCase.getById(1);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id__in: [1] }],
			});
			expect(tc1['serialized']).toEqual(origVal);

			await tc1.syncServerValues();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id: 1 }],
				callIndex: 1,
			});
			expect(tc1['serialized']).toEqual(updatedVal);
		});

		it('Can update test case values', async () => {
			const origVal = mockTestCase();
			const tc1 = new TestCase(origVal);
			const changeVals: Partial<TestCaseWriteValues> = {
				author: 2,
				text: 'New and improved test case',
				notes: 'This test has been updated',
			};
			const updateResponseVals = mockTestCaseUpdateResponse({
				author: 2,
				author__username: 'bob',
				text: 'New and improved test case',
				notes: 'This test has been updated',
			});
			const newTestVals = mockTestCase({
				author: 2,
				author__username: 'bob',
				text: 'New and improved test case',
				notes: 'This test has been updated',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponseVals,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [newTestVals],
			}));
			expect(tc1['serialized']).toEqual(origVal);
			await tc1.serverUpdate(changeVals);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, changeVals],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id: 1 }],
				callIndex: 1,
			});
			expect(tc1.getAuthorId()).toEqual(2);
			expect(tc1.getAuthorName()).toEqual('bob');
			expect(tc1.getNotes()).toEqual('This test has been updated');
			expect(tc1.getText()).toEqual('New and improved test case');
		});

		it('Can update automation flag with .setAutomation()', async () => {
			const tc1 = new TestCase(mockTestCase());
			const updateResponse = mockTestCaseUpdateResponse({
				is_automated: true,
			});
			const updateVal = mockTestCase({ is_automated: true });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.isAutomated()).toEqual(false);
			expect(tc1.isManual()).toEqual(true);

			await tc1.setAutomation(true);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { is_automated: true }],
			});

			expect(tc1.isAutomated()).toEqual(true);
			expect(tc1.isManual()).toEqual(false);
		});

		it('Can enable automation flag with .setIsAutomated()', async () => {
			const tc1 = new TestCase(mockTestCase());
			const updateResponse = mockTestCaseUpdateResponse({
				is_automated: true,
			});
			const updateVal = mockTestCase({ is_automated: true });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.isAutomated()).toEqual(false);
			expect(tc1.isManual()).toEqual(true);

			await tc1.setIsAutomated();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { is_automated: true }],
			});

			expect(tc1.isAutomated()).toEqual(true);
			expect(tc1.isManual()).toEqual(false);
		});

		it('Can disable automation flag with .setIsManual()', async () => {
			const tc1 = new TestCase(mockTestCase({ is_automated: true }));
			const updateResponse = mockTestCaseUpdateResponse({
				is_automated: false,
			});
			const updateVal = mockTestCase({ is_automated: false });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.isAutomated()).toEqual(true);
			expect(tc1.isManual()).toEqual(false);

			await tc1.setIsManual();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { is_automated: false }],
			});

			expect(tc1.isAutomated()).toEqual(false);
			expect(tc1.isManual()).toEqual(true);
		});

		it('Can set a new script value', async () => {
			const tc1 = new TestCase(mockTestCase({
				script: 'original script',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				script: 'new script',
			});
			const updateVal = mockTestCase({ script: 'new script' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getScript()).toEqual('original script');

			await tc1.setScript('new script');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { script: 'new script' }],
			});

			expect(tc1.getScript()).toEqual('new script');
		});

		it('Can erase existing script value', async () => {
			const tc1 = new TestCase(mockTestCase({
				script: 'original script',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				script: '',
			});
			const updateVal = mockTestCase({ script: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getScript()).toEqual('original script');

			await tc1.setScript();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { script: '' }],
			});

			expect(tc1.getScript()).toEqual('');
		});

		it('Can set a new arguments value', async () => {
			const tc1 = new TestCase(mockTestCase({
				arguments: 'original args',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				arguments: 'new args',
			});
			const updateVal = mockTestCase({ arguments: 'new args' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getArguments()).toEqual('original args');

			await tc1.setArguments('new args');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { arguments: 'new args' }],
			});

			expect(tc1.getArguments()).toEqual('new args');
		});

		it('Can erase existing arguments value', async () => {
			const tc1 = new TestCase(mockTestCase({
				arguments: 'original args',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				arguments: '',
			});
			const updateVal = mockTestCase({ arguments: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getArguments()).toEqual('original args');

			await tc1.setArguments();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { arguments: '' }],
			});

			expect(tc1.getArguments()).toEqual('');
		});

		it('Can set a new requirements value', async () => {
			const tc1 = new TestCase(mockTestCase({
				requirement: 'original reqs',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				requirement: 'new reqs',
			});
			const updateVal = mockTestCase({ requirement: 'new reqs' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getRequirements()).toEqual('original reqs');

			await tc1.setRequirements('new reqs');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { requirement: 'new reqs' }],
			});

			expect(tc1.getRequirements()).toEqual('new reqs');
		});

		it('Can erase existing requirements value', async () => {
			const tc1 = new TestCase(mockTestCase({
				requirement: 'original reqs',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				requirement: '',
			});
			const updateVal = mockTestCase({ requirement: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getRequirements()).toEqual('original reqs');

			await tc1.setRequirements();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { requirement: '' }],
			});

			expect(tc1.getRequirements()).toEqual('');
		});

		it('Can set a new extra link value', async () => {
			const tc1 = new TestCase(mockTestCase({
				extra_link: 'original link',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: 'new link',
			});
			const updateVal = mockTestCase({ extra_link: 'new link' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getExtraLink()).toEqual('original link');

			await tc1.setExtraLink('new link');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { extra_link: 'new link' }],
			});

			expect(tc1.getExtraLink()).toEqual('new link');
		});

		it('Can erase existing extra link value', async () => {
			const tc1 = new TestCase(mockTestCase({
				extra_link: 'original link',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: '',
			});
			const updateVal = mockTestCase({ extra_link: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getExtraLink()).toEqual('original link');

			await tc1.setExtraLink();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { extra_link: '' }],
			});

			expect(tc1.getExtraLink()).toEqual('');
		});

		it('Can set a new reference link value', async () => {
			const tc1 = new TestCase(mockTestCase({
				extra_link: 'original link',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: 'new link',
			});
			const updateVal = mockTestCase({ extra_link: 'new link' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReferenceLink()).toEqual('original link');

			await tc1.setReferenceLink('new link');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { extra_link: 'new link' }],
			});

			expect(tc1.getReferenceLink()).toEqual('new link');
		});

		it('Can erase existing reference link value', async () => {
			const tc1 = new TestCase(mockTestCase({
				extra_link: 'original link',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: '',
			});
			const updateVal = mockTestCase({ extra_link: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReferenceLink()).toEqual('original link');

			await tc1.setReferenceLink();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { extra_link: '' }],
			});

			expect(tc1.getReferenceLink()).toEqual('');
		});

		it('Can set a new summary value', async () => {
			const tc1 = new TestCase(mockTestCase({
				summary: 'original test case name',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				summary: 'new name',
			});
			const updateVal = mockTestCase({ summary: 'new name' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getSummary()).toEqual('original test case name');

			await tc1.setSummary('new name');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { summary: 'new name' }],
			});

			expect(tc1.getSummary()).toEqual('new name');
		});

		it('Can set a new title value', async () => {
			const tc1 = new TestCase(mockTestCase({
				summary: 'original test case name',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				summary: 'new name',
			});
			const updateVal = mockTestCase({ summary: 'new name' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getTitle()).toEqual('original test case name');

			await tc1.setTitle('new name');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { summary: 'new name' }],
			});

			expect(tc1.getTitle()).toEqual('new name');
		});

		it('Can set a new text value', async () => {
			const tc1 = new TestCase(mockTestCase({
				text: 'original test case text',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				text: 'new text',
			});
			const updateVal = mockTestCase({ text: 'new text' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getText()).toEqual('original test case text');

			await tc1.setText('new text');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { text: 'new text' }],
			});

			expect(tc1.getText()).toEqual('new text');
		});

		it('Can set a new description value', async () => {
			const tc1 = new TestCase(mockTestCase({
				text: 'original test case text',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				text: 'new text',
			});
			const updateVal = mockTestCase({ text: 'new text' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getDescription()).toEqual('original test case text');

			await tc1.setDescription('new text');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { text: 'new text' }],
			});

			expect(tc1.getDescription()).toEqual('new text');
		});

		it('Can delete text value', async () => {
			const tc1 = new TestCase(mockTestCase({
				text: 'original test case text',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				text: '',
			});
			const updateVal = mockTestCase({ text: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getText()).toEqual('original test case text');

			await tc1.setText();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { text: '' }],
			});

			expect(tc1.getText()).toEqual('');
		});

		it('Can set a new notes value', async () => {
			const tc1 = new TestCase(mockTestCase({
				notes: 'original test case notes',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				notes: 'new notes',
			});
			const updateVal = mockTestCase({ notes: 'new notes' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getNotes()).toEqual('original test case notes');

			await tc1.setNotes('new notes');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { notes: 'new notes' }],
			});

			expect(tc1.getNotes()).toEqual('new notes');
		});

		it('Can delete notes value', async () => {
			const tc1 = new TestCase(mockTestCase({
				notes: 'original test case notes',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				notes: '',
			});
			const updateVal = mockTestCase({ notes: '' });

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getNotes()).toEqual('original test case notes');

			await tc1.setNotes();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { notes: '' }],
			});

			expect(tc1.getNotes()).toEqual('');
		});

		it('Can set a new setup duration value', async () => {
			const tc1 = new TestCase(mockTestCase({
				setup_duration: 124,
				testing_duration: 8,
				expected_duration: 132,
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				setup_duration: '0:07:03',
				testing_duration: '0:00:08',
			});
			const updateVal = mockTestCase({
				setup_duration: 423,
				testing_duration: 8,
				expected_duration: 431,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getSetupDuration()).toEqual(124);
			expect(tc1.getTestingDuration()).toEqual(8);
			expect(tc1.getTotalDuration()).toEqual(132);

			await tc1.setSetupDuration(423);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { setup_duration: 423 }],
			});

			expect(tc1.getSetupDuration()).toEqual(423);
			expect(tc1.getTestingDuration()).toEqual(8);
			expect(tc1.getTotalDuration()).toEqual(431);
		});

		it('Can delete setup duration value', async () => {
			const tc1 = new TestCase(mockTestCase({
				setup_duration: 124,
				testing_duration: 8,
				expected_duration: 132,
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				setup_duration: '0:00:00',
				testing_duration: '0:00:08',
			});
			const updateVal = mockTestCase({
				setup_duration: 0,
				testing_duration: 8,
				expected_duration: 8,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getSetupDuration()).toEqual(124);
			expect(tc1.getTestingDuration()).toEqual(8);
			expect(tc1.getTotalDuration()).toEqual(132);

			await tc1.setSetupDuration();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { setup_duration: 0 }],
			});

			expect(tc1.getSetupDuration()).toEqual(0);
			expect(tc1.getTestingDuration()).toEqual(8);
			expect(tc1.getTotalDuration()).toEqual(8);
		});

		it('Can set a new testing duration value', async () => {
			const tc1 = new TestCase(mockTestCase({
				setup_duration: 124,
				testing_duration: 8,
				expected_duration: 132,
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				setup_duration: '0:07:03',
				testing_duration: '1:00:08',
			});
			const updateVal = mockTestCase({
				setup_duration: 124,
				testing_duration: 3608,
				expected_duration: 3732,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getSetupDuration()).toEqual(124);
			expect(tc1.getTestingDuration()).toEqual(8);
			expect(tc1.getTotalDuration()).toEqual(132);

			await tc1.setTestingDuration(3608);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { testing_duration: 3608 }],
			});

			expect(tc1.getSetupDuration()).toEqual(124);
			expect(tc1.getTestingDuration()).toEqual(3608);
			expect(tc1.getTotalDuration()).toEqual(3732);
		});

		it('Can delete testing duration value', async () => {
			const tc1 = new TestCase(mockTestCase({
				setup_duration: 124,
				testing_duration: 8,
				expected_duration: 132,
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				setup_duration: '0:07:03',
				testing_duration: '0:00:00',
			});
			const updateVal = mockTestCase({
				setup_duration: 124,
				testing_duration: 0,
				expected_duration: 124,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getSetupDuration()).toEqual(124);
			expect(tc1.getTestingDuration()).toEqual(8);
			expect(tc1.getTotalDuration()).toEqual(132);

			await tc1.setTestingDuration();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { testing_duration: 0 }],
			});

			expect(tc1.getSetupDuration()).toEqual(124);
			expect(tc1.getTestingDuration()).toEqual(0);
			expect(tc1.getTotalDuration()).toEqual(124);
		});

		it('Can set a new priority from id', async () => {
			const tc1 = new TestCase(mockTestCase({
				priority: 1,
				priority__value: 'P1',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				priority: 2,
				priority__value: 'P2',
			});
			const updateVal = mockTestCase({
				priority: 2,
				priority__value: 'P2',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getPriorityId()).toEqual(1);
			expect(tc1.getPriorityValue()).toEqual('P1');

			await tc1.setPriority(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { priority: 2 }],
			});

			expect(tc1.getPriorityId()).toEqual(2);
			expect(tc1.getPriorityValue()).toEqual('P2');
		});

		it('Can set a new priority from Priority', async () => {
			const tc1 = new TestCase(mockTestCase({
				priority: 1,
				priority__value: 'P1',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				priority: 2,
				priority__value: 'P2',
			});
			const updateVal = mockTestCase({
				priority: 2,
				priority__value: 'P2',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getPriorityId()).toEqual(1);
			expect(tc1.getPriorityValue()).toEqual('P1');

			const p2 = new Priority(mockPriority({
				id: 2,
				value: 'P2',
			}));
			await tc1.setPriority(p2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { priority: 2 }],
			});

			expect(tc1.getPriorityId()).toEqual(2);
			expect(tc1.getPriorityValue()).toEqual('P2');
		});

		it('Can set a new priority from Priority Name', async () => {
			const tc1 = new TestCase(mockTestCase({
				priority: 1,
				priority__value: 'P1',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				priority: 2,
				priority__value: 'P2',
			});
			const updateVal = mockTestCase({
				priority: 2,
				priority__value: 'P2',
			});
			const p2Vals = mockPriority({
				id: 2,
				value: 'P2',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [p2Vals],
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getPriorityId()).toEqual(1);
			expect(tc1.getPriorityValue()).toEqual('P1');

			await tc1.setPriority('P2');
			assertPostRequestData({
				mockPostRequest,
				method: 'Priority.filter',
				params: [{ value: 'P2' }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { priority: 2 }],
				callIndex: 1,
			});

			expect(tc1.getPriorityId()).toEqual(2);
			expect(tc1.getPriorityValue()).toEqual('P2');
		});

		it('Can set a new Author by ID', async () => {
			const tc1 = new TestCase(mockTestCase({
				author: 1,
				author__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				author: 2,
				author__username: 'bob',
			});
			const updateVal = mockTestCase({
				author: 2,
				author__username: 'bob',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getAuthorId()).toEqual(1);
			expect(tc1.getAuthorName()).toEqual('alice');

			await tc1.setAuthor(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { author: 2 }],
			});

			expect(tc1.getAuthorId()).toEqual(2);
			expect(tc1.getAuthorName()).toEqual('bob');
		});

		it('Can set a new Author by User', async () => {
			const tc1 = new TestCase(mockTestCase({
				author: 1,
				author__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				author: 2,
				author__username: 'bob',
			});
			const updateVal = mockTestCase({
				author: 2,
				author__username: 'bob',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getAuthorId()).toEqual(1);
			expect(tc1.getAuthorName()).toEqual('alice');

			const bob = new User(mockUser({ id: 2, username: 'bob' }));
			await tc1.setAuthor(bob);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { author: 2 }],
			});

			expect(tc1.getAuthorId()).toEqual(2);
			expect(tc1.getAuthorName()).toEqual('bob');
		});

		it('Can set a new Author by username', async () => {
			const tc1 = new TestCase(mockTestCase({
				author: 1,
				author__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				author: 2,
				author__username: 'bob',
			});
			const updateVal = mockTestCase({
				author: 2,
				author__username: 'bob',
			});

			const user2Vals = mockUser({
				id: 2,
				username: 'bob',
				email: 'bob@example.com',
				first_name: 'Bob',
				last_name: 'Bar',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [user2Vals],
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getAuthorId()).toEqual(1);
			expect(tc1.getAuthorName()).toEqual('alice');

			await tc1.setAuthor('bob');
			assertPostRequestData({
				mockPostRequest,
				method: 'User.filter',
				params: [{ username: 'bob' }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { author: 2 }],
				callIndex: 1,
			});

			expect(tc1.getAuthorId()).toEqual(2);
			expect(tc1.getAuthorName()).toEqual('bob');
		});

		it('Can set a new Reviewer by ID', async () => {
			const tc1 = new TestCase(mockTestCase({
				reviewer: 1,
				reviewer__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				reviewer: 2,
				reviewer__username: 'bob',
			});
			const updateVal = mockTestCase({
				reviewer: 2,
				reviewer__username: 'bob',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReviewerId()).toEqual(1);
			expect(tc1.getReviewerName()).toEqual('alice');

			await tc1.setReviewer(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { reviewer: 2 }],
			});

			expect(tc1.getReviewerId()).toEqual(2);
			expect(tc1.getReviewerName()).toEqual('bob');
		});

		it('Can set a new Reviewer by User', async () => {
			const tc1 = new TestCase(mockTestCase({
				reviewer: 1,
				reviewer__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				reviewer: 2,
				reviewer__username: 'bob',
			});
			const updateVal = mockTestCase({
				reviewer: 2,
				reviewer__username: 'bob',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReviewerId()).toEqual(1);
			expect(tc1.getReviewerName()).toEqual('alice');

			const bob = new User(mockUser({ id: 2, username: 'bob' }));
			await tc1.setReviewer(bob);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { reviewer: 2 }],
			});

			expect(tc1.getReviewerId()).toEqual(2);
			expect(tc1.getReviewerName()).toEqual('bob');
		});

		it('Can set a new Reviewer by username', async () => {
			const tc1 = new TestCase(mockTestCase({
				reviewer: 1,
				reviewer__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				reviewer: 2,
				reviewer__username: 'bob',
			});
			const updateVal = mockTestCase({
				reviewer: 2,
				reviewer__username: 'bob',
			});

			const user2Vals = mockUser({
				id: 2,
				username: 'bob',
				email: 'bob@example.com',
				first_name: 'Bob',
				last_name: 'Bar',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [user2Vals],
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReviewerId()).toEqual(1);
			expect(tc1.getReviewerName()).toEqual('alice');

			await tc1.setReviewer('bob');
			assertPostRequestData({
				mockPostRequest,
				method: 'User.filter',
				params: [{ username: 'bob' }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { reviewer: 2 }],
				callIndex: 1,
			});

			expect(tc1.getReviewerId()).toEqual(2);
			expect(tc1.getReviewerName()).toEqual('bob');
		});

		it('Can remove Reviewer by omitting new Reviewer value', async () => {
			const tc1 = new TestCase(mockTestCase({
				reviewer: 1,
				reviewer__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				reviewer: null,
				reviewer__username: null,
			});
			const updateVal = mockTestCase({
				reviewer: null,
				reviewer__username: null,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReviewerId()).toEqual(1);
			expect(tc1.getReviewerName()).toEqual('alice');

			await tc1.setReviewer();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { reviewer: null }],
			});

			expect(tc1.getReviewerId()).toBeNull();
			expect(tc1.getReviewerName()).toBeNull();
		});

		it('Can remove Reviewer by using null as new Reviewer value', async () => {
			const tc1 = new TestCase(mockTestCase({
				reviewer: 1,
				reviewer__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				reviewer: null,
				reviewer__username: null,
			});
			const updateVal = mockTestCase({
				reviewer: null,
				reviewer__username: null,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getReviewerId()).toEqual(1);
			expect(tc1.getReviewerName()).toEqual('alice');

			await tc1.setReviewer(null);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { reviewer: null }],
			});

			expect(tc1.getReviewerId()).toBeNull();
			expect(tc1.getReviewerName()).toBeNull();
		});

		it('Can set a new DefaultTester by ID', async () => {
			const tc1 = new TestCase(mockTestCase({
				default_tester: 1,
				default_tester__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				default_tester: 2,
				default_tester__username: 'bob',
			});
			const updateVal = mockTestCase({
				default_tester: 2,
				default_tester__username: 'bob',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc1.getDefaultTesterName()).toEqual('alice');

			await tc1.setDefaultTester(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { default_tester: 2 }],
			});

			expect(tc1.getDefaultTesterId()).toEqual(2);
			expect(tc1.getDefaultTesterName()).toEqual('bob');
		});

		it('Can set a new DefaultTester by User', async () => {
			const tc1 = new TestCase(mockTestCase({
				default_tester: 1,
				default_tester__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				default_tester: 2,
				default_tester__username: 'bob',
			});
			const updateVal = mockTestCase({
				default_tester: 2,
				default_tester__username: 'bob',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc1.getDefaultTesterName()).toEqual('alice');

			const bob = new User(mockUser({ id: 2, username: 'bob' }));
			await tc1.setDefaultTester(bob);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { default_tester: 2 }],
			});

			expect(tc1.getDefaultTesterId()).toEqual(2);
			expect(tc1.getDefaultTesterName()).toEqual('bob');
		});

		it('Can set a new DefaultTester by username', async () => {
			const tc1 = new TestCase(mockTestCase({
				default_tester: 1,
				default_tester__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				default_tester: 2,
				default_tester__username: 'bob',
			});
			const updateVal = mockTestCase({
				default_tester: 2,
				default_tester__username: 'bob',
			});

			const user2Vals = mockUser({
				id: 2,
				username: 'bob',
				email: 'bob@example.com',
				first_name: 'Bob',
				last_name: 'Bar',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [user2Vals],
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc1.getDefaultTesterName()).toEqual('alice');

			await tc1.setDefaultTester('bob');
			assertPostRequestData({
				mockPostRequest,
				method: 'User.filter',
				params: [{ username: 'bob' }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { default_tester: 2 }],
				callIndex: 1,
			});

			expect(tc1.getDefaultTesterId()).toEqual(2);
			expect(tc1.getDefaultTesterName()).toEqual('bob');
		});

		it('Can remove DefaultTester by omitting new DefaultTester value', async () => {
			const tc1 = new TestCase(mockTestCase({
				default_tester: 1,
				default_tester__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				default_tester: null,
				default_tester__username: null,
			});
			const updateVal = mockTestCase({
				default_tester: null,
				default_tester__username: null,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc1.getDefaultTesterName()).toEqual('alice');

			await tc1.setDefaultTester();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { default_tester: null }],
			});

			expect(tc1.getDefaultTesterId()).toBeNull();
			expect(tc1.getDefaultTesterName()).toBeNull();
		});

		it('Can remove DefaultTester by using null as new DefaultTester value', async () => {
			const tc1 = new TestCase(mockTestCase({
				default_tester: 1,
				default_tester__username: 'alice',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				default_tester: null,
				default_tester__username: null,
			});
			const updateVal = mockTestCase({
				default_tester: null,
				default_tester__username: null,
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc1.getDefaultTesterName()).toEqual('alice');

			await tc1.setDefaultTester(null);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { default_tester: null }],
			});

			expect(tc1.getDefaultTesterId()).toBeNull();
			expect(tc1.getDefaultTesterName()).toBeNull();
		});

		it('Can set a new value for Category', async () => {
			const tc1 = new TestCase(mockTestCase({
				category: 1,
				category__name: '--default--',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				category: 4,
				category__name: 'Regression',
			});
			const updateVal = mockTestCase({
				category: 4,
				category__name: 'Regression',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: updateResponse,
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getCategoryId()).toEqual(1);
			expect(tc1.getCategoryName()).toEqual('--default--');

			await tc1.setCategory(4);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { category: 4 }],
			});

			expect(tc1.getCategoryId()).toEqual(4);
			expect(tc1.getCategoryName()).toEqual('Regression');
		});

		it('Can set a new value for Case Status', async () => {
			const caseStatus2 = new TestCaseStatus(mockTestCaseStatus({
				id: 2,
				name: 'CONFIRMED',
				is_confirmed: true,
				description: 'Ready to test',
			}));
			const tc1 = new TestCase(mockTestCase({
				case_status: 1,
				case_status__name: 'PROPOSED',
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				case_status: 2,
				case_status__name: 'CONFIRMED',
			});

			const updateVal = mockTestCase({
				case_status: 2,
				case_status__name: 'CONFIRMED',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [updateResponse],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [updateVal],
			}));

			expect(tc1.getCaseStatusId()).toEqual(1);
			expect(tc1.getCaseStatusName()).toEqual('PROPOSED');

			await tc1.setCaseStatus(caseStatus2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.update',
				params: [1, { case_status: 2 }],
			});

			expect(tc1.getCaseStatusId()).toEqual(2);
			expect(tc1.getCaseStatusName()).toEqual('CONFIRMED');
		});

		it('Can add a Component by ID', async () => {
			const componentVals = mockComponent();
			const tc1 = new TestCase(mockTestCase());
			// Resolve component from ID
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [componentVals],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [componentVals],
			}));

			await tc1.addComponent(componentVals.id);

			assertPostRequestData({
				mockPostRequest,
				method: 'Component.filter',
				params: [{ id__in: [1] }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_component',
				params: [1, componentVals.name],
				callIndex: 1,
			});
		});

		it('Can add a Component by Name', async () => {
			const componentVals = mockComponent();
			const tc1 = new TestCase(mockTestCase());
			// Add component to TC
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [componentVals],
			}));

			await tc1.addComponent(componentVals.name);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_component',
				params: [1, componentVals.name],
			});
		});

		it('Can add a Component using Component object', async () => {
			const componentVals = mockComponent();
			const tc1 = new TestCase(mockTestCase());
			// Add component to TC
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [componentVals],
			}));

			await tc1.addComponent(new Component(componentVals));

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_component',
				params: [1, componentVals.name],
			});
		});

		it('Can remove a Component by ID', async () => {
			const componentVals = mockComponent({
				id: 54,
			});
			const tc1 = new TestCase(mockTestCase());
			// Add component to TC
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.removeComponent(componentVals.id);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_component',
				params: [1, componentVals.id],
			});
		});

		it('Can remove a Component by Component object', async () => {
			const componentVals = mockComponent({
				id: 54,
			});
			const tc1 = new TestCase(mockTestCase());
			// Add component to TC
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			const component = new Component(componentVals);
			await tc1.removeComponent(component);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_component',
				params: [1, componentVals.id],
			});
		});

		it('Can add tag by Name', async () => {
			const tc1 = new TestCase(mockTestCase());
			const tag1 = new Tag(mockTag());

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.addTag(tag1.getName());

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_tag',
				params: [1, 'ExampleTag'],
			});
		});

		it('Can remove tag by Name', async () => {
			const tc1 = new TestCase(mockTestCase());
			const tag1 = new Tag(mockTag());

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.removeTag(tag1.getName());

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_tag',
				params: [1, 'ExampleTag'],
			});
		});

		it('Can add tag by Tag object', async () => {
			const tc1 = new TestCase(mockTestCase());
			const tag1 = new Tag(mockTag());

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.addTag(tag1);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_tag',
				params: [1, 'ExampleTag'],
			});
		});

		it('Can remove tag by Tag object', async () => {
			const tc1 = new TestCase(mockTestCase());
			const tag1 = new Tag(mockTag());

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.removeTag(tag1);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_tag',
				params: [1, 'ExampleTag'],
			});
		});

		it('Can add tag by ID', async () => {
			const tc1 = new TestCase(mockTestCase());
			const tag1 = new Tag(mockTag());

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [mockTag()],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.addTag(tag1.getId());

			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ id__in: [1] }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_tag',
				params: [1, 'ExampleTag'],
				callIndex: 1,
			});
		});

		it('Can add tag by ID', async () => {
			const tc1 = new TestCase(mockTestCase());
			const tag1 = new Tag(mockTag());

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [mockTag()],
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc1.removeTag(tag1.getId());

			assertPostRequestData({
				mockPostRequest,
				method: 'Tag.filter',
				params: [{ id__in: [1] }],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_tag',
				params: [1, 'ExampleTag'],
				callIndex: 1,
			});
		});

		it('Can add TestCase Property', async () => {
			const tc = new TestCase(mockTestCase({ id: 3 }));
			const propVals = mockTestCaseProperty({
				name: 'propName',
				value: 'propVal',
			});
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: propVals,
			}));

			expect(await tc.addProperty('propName', 'propVal'))
				.toEqual(new TestCaseProperty(propVals));
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_property',
				params: [3, 'propName', 'propVal'],
			});
		});

		it('Can remove TestCase Property by specific value', async () => {
			const tc = new TestCase(mockTestCase({ id: 3 }));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc.removeProperty('propName', 'propVal');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_property',
				params: [{
					case: 3,
					name: 'propName',
					value: 'propVal',
				}],
			});
		});

		it('Can remove TestCase Property (all values)', async () => {
			const tc = new TestCase(mockTestCase({ id: 3 }));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: null,
			}));

			await tc.removeProperty('propName');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_property',
				params: [{
					case: 3,
					name: 'propName',
				}],
			});
		});

		it('Can add a Comment to TestCase', async () => {
			const tc = new TestCase(mockTestCase());
			const commentValue = mockTestCaseComment({
				comment: 'Sample Comment',
			});
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: commentValue,
			}));
			const result = await tc.addComment('Sample Comment');
			expect(result).toEqual(new Comment(commentValue));
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.add_comment',
				params: [1, 'Sample Comment'],
			});
		});

		it('Can remove a Comment from TestCase by ID', async () => {
			const tc = new TestCase(mockTestCase());
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: null,
			}));
			const result = await tc.removeComment(2);
			expect(result).toEqual(undefined);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_comment',
				params: [1, 2],
			});
		});

		it('Can remove a Comment from TestCase by Comment', async () => {
			const tc = new TestCase(mockTestCase());
			const commentValue = mockTestCaseComment({
				id: 2,
				comment: 'Sample Comment',
			});
			const comment2 = new Comment(commentValue);
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: null,
			}));
			const result = await tc.removeComment(comment2);
			expect(result).toEqual(undefined);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_comment',
				params: [1, 2],
			});
		});

		it('Can remove all Comments from TestCase', async () => {
			const tc = new TestCase(mockTestCase());
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: null,
			}));
			const result = await tc.removeAllComments();
			expect(result).toEqual(undefined);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.remove_comment',
				params: [1, null],
			});
		});
	});

	describe('Creating TestCase', () => {
		it('Can create new TestCase with minimum values', async () => {
			const createVals: TestCaseCreateValues = {
				summary: 'TestCase from unit tests',
				product: 1,
				category: 1,
				priority: 1,
				case_status: 1,
			};
			const newTCVals = mockTestCase({
				summary: 'TestCase from unit tests',
			});

			// Create response - non-calculated TC fields
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: {
					id: newTCVals.id,
					is_automated: newTCVals.is_automated,
					script: newTCVals.script,
					arguments: newTCVals.arguments,
					extra_link: newTCVals.extra_link,
					summary: newTCVals.summary,
					requirement: newTCVals.requirement,
					notes: newTCVals.notes,
					text: newTCVals.text,
					setup_duration: newTCVals.setup_duration,
					testing_duration: newTCVals.testing_duration,
					case_status: newTCVals.case_status,
					category: newTCVals.category,
					priority: newTCVals.priority,
					author: newTCVals.author,
					default_tester: newTCVals.default_tester,
					reviewer: newTCVals.reviewer,
					create_date: newTCVals.create_date,
				},
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [newTCVals],
			}));

			const result = await TestCase.create(createVals);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.create',
				params: [createVals],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id__in: [1] }],
				callIndex: 1,
			});
			expect(result).toEqual(new TestCase(newTCVals));
		});

		it('Can create new TestCase with additional values', async () => {
			const createVals: TestCaseCreateValues = {
				summary: 'TestCase from unit tests',
				product: 1,
				category: 1,
				priority: 1,
				case_status: 1,
				notes: 'Custom notes',
				default_tester: 2,
				setup_duration: 30,
				testing_duration: 90,
			};
			const newTCVals = mockTestCase({
				summary: 'TestCase from unit tests',
				notes: 'Custom notes',
				default_tester: 2,
				default_tester__username: 'bob',
				setup_duration: 30,
				testing_duration: 90,
				expected_duration: 120,
			});

			// Create response - non-calculated TC fields
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: {
					id: newTCVals.id,
					is_automated: newTCVals.is_automated,
					script: newTCVals.script,
					arguments: newTCVals.arguments,
					extra_link: newTCVals.extra_link,
					summary: newTCVals.summary,
					requirement: newTCVals.requirement,
					notes: newTCVals.notes,
					text: newTCVals.text,
					setup_duration: newTCVals.setup_duration,
					testing_duration: newTCVals.testing_duration,
					case_status: newTCVals.case_status,
					category: newTCVals.category,
					priority: newTCVals.priority,
					author: newTCVals.author,
					default_tester: newTCVals.default_tester,
					reviewer: newTCVals.reviewer,
					create_date: newTCVals.create_date,
				},
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [newTCVals],
			}));

			const result = await TestCase.create(createVals);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.create',
				params: [createVals],
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id__in: [1] }],
				callIndex: 1,
			});
			expect(result).toEqual(new TestCase(newTCVals));
			expect(result.getSummary()).toEqual('TestCase from unit tests');
			expect(result.getTestingDuration()).toEqual(90);
			expect(result.getSetupDuration()).toEqual(30);
			expect(result.getTotalDuration()).toEqual(120);
			expect(result.getDefaultTesterId()).toEqual(2);
			expect(result.getDefaultTesterName()).toEqual('bob');
			expect(result.getNotes()).toEqual('Custom notes');
		});
	});

	it('Can resolve TestCase ID from TestCase', () => {
		const tc5 = new TestCase(mockTestCase({
			id: 5,
		}));
		const tc10 = new TestCase(mockTestCase({
			id: 10,
		}));
		expect(TestCase.resolveTestCaseId(tc5)).toEqual(5);
		expect(TestCase.resolveTestCaseId(tc10)).toEqual(10);
	});

	it('Can resolve TestCase ID given ID', () => {
		expect(TestCase.resolveTestCaseId(4)).toEqual(4);
		expect(TestCase.resolveTestCaseId(6)).toEqual(6);
	});
});
