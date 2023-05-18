import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

import TestCase from './testCase';
import Priority from '../management/priority';
import Category from './category';
import TestCaseStatus from './testCaseStatus';
import {
	mockPriority,
	mockTestCase,
	mockTestCaseStatus,
	mockUser,
} from '../../test/mockKiwiValues';
import User from '../management/user';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import { TestCaseWriteValues } from './testCase.type';
import { 
	mockTestCaseUpdateResponse 
} from '../../test/mockValues/testCases/mockTestCaseValues';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

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

			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [tcStatus2Vals],
				})
			);
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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [regressionCategoryVals],
				})
			);
			const regressionCategory = await tc1.getCategory();
			expect(regressionCategory)
				.toEqual(new Category(regressionCategoryVals));
		});

		it('Can get TC Priority', async () => {
			const priority1Vals = mockPriority();
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [priority1Vals],
				})
			);
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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [mockUser()],
				})
			);
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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [userVals],
				})
			);
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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [mockUser()],
				})
			);
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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [case1Vals],
				})
			);
			const testCaseOne = await TestCase.getById(1);
			expect(testCaseOne).toEqual(new TestCase(case1Vals));
		});

		it('Can get TC by a single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			expect(TestCase.getById(1)).rejects.toThrowError(
				'Could not find any TestCase with ID 1'
			);
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

			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({
					result: [origVal],
				})
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({
					result: [updatedVal],
				})
			);

			const tc1 = await TestCase.getById(1);
			verifyRpcCall(mockAxios, 0, 'TestCase.filter', [{ id__in: [1] }]);
			expect(tc1['serialized']).toEqual(origVal);

			await tc1.syncServerValues();
			verifyRpcCall(mockAxios, 1, 'TestCase.filter', [{ id: 1 }]);
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
				notes: 'This test has been updated'
			});
			const newTestVals = mockTestCase({
				author: 2,
				author__username: 'bob',
				text: 'New and improved test case',
				notes: 'This test has been updated'
			});

			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({
					result: updateResponseVals,
				})
			);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({
					result: [newTestVals],
				})
			);
			expect(tc1['serialized']).toEqual(origVal);
			await tc1.serverUpdate(changeVals);
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [1, changeVals]);
			verifyRpcCall(mockAxios, 1, 'TestCase.filter', [{ id: 1 }]);
			expect(tc1.getAuthorId()).toEqual(2);
			expect(tc1.getAuthorName()).toEqual('bob');
			expect(tc1.getNotes()).toEqual('This test has been updated');
			expect(tc1.getText()).toEqual('New and improved test case');
		});

		it('Can update automation flag with .setAutomation()', async () => {
			const tc1 = new TestCase(mockTestCase());
			const updateResponse = mockTestCaseUpdateResponse({
				is_automated: true
			});
			const updateVal = mockTestCase({ is_automated: true });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.isAutomated()).toEqual(false);
			expect(tc1.isManual()).toEqual(true);

			await tc1.setAutomation(true);
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ is_automated: true }
			]);

			expect(tc1.isAutomated()).toEqual(true);
			expect(tc1.isManual()).toEqual(false);
		});

		it('Can enable automation flag with .setIsAutomated()', async () => {
			const tc1 = new TestCase(mockTestCase());
			const updateResponse = mockTestCaseUpdateResponse({
				is_automated: true
			});
			const updateVal = mockTestCase({ is_automated: true });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.isAutomated()).toEqual(false);
			expect(tc1.isManual()).toEqual(true);

			await tc1.setIsAutomated();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ is_automated: true }
			]);

			expect(tc1.isAutomated()).toEqual(true);
			expect(tc1.isManual()).toEqual(false);
		});

		it('Can disable automation flag with .setIsManual()', async () => {
			const tc1 = new TestCase(mockTestCase({ is_automated: true }));
			const updateResponse = mockTestCaseUpdateResponse({
				is_automated: false
			});
			const updateVal = mockTestCase({ is_automated: false });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.isAutomated()).toEqual(true);
			expect(tc1.isManual()).toEqual(false);

			await tc1.setIsManual();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ is_automated: false }
			]);

			expect(tc1.isAutomated()).toEqual(false);
			expect(tc1.isManual()).toEqual(true);
		});

		it('Can set a new script value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				script: 'original script' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				script: 'new script'
			});
			const updateVal = mockTestCase({ script: 'new script' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getScript()).toEqual('original script');

			await tc1.setScript('new script');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ script: 'new script' }
			]);

			expect(tc1.getScript()).toEqual('new script');
		});

		it('Can erase existing script value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				script: 'original script' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				script: ''
			});
			const updateVal = mockTestCase({ script: '' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getScript()).toEqual('original script');

			await tc1.setScript();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ script: '' }
			]);

			expect(tc1.getScript()).toEqual('');
		});

		it('Can set a new arguments value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				arguments: 'original args' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				arguments: 'new args'
			});
			const updateVal = mockTestCase({ arguments: 'new args' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getArguments()).toEqual('original args');

			await tc1.setArguments('new args');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ arguments: 'new args' }
			]);

			expect(tc1.getArguments()).toEqual('new args');
		});

		it('Can erase existing arguments value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				arguments: 'original args' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				arguments: ''
			});
			const updateVal = mockTestCase({ arguments: '' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getArguments()).toEqual('original args');

			await tc1.setArguments();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ arguments: '' }
			]);

			expect(tc1.getArguments()).toEqual('');
		});

		it('Can set a new requirements value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				requirement: 'original reqs' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				requirement: 'new reqs'
			});
			const updateVal = mockTestCase({ requirement: 'new reqs' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getRequirements()).toEqual('original reqs');

			await tc1.setRequirements('new reqs');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ requirement: 'new reqs' }
			]);

			expect(tc1.getRequirements()).toEqual('new reqs');
		});

		it('Can erase existing requirements value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				requirement: 'original reqs' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				requirement: ''
			});
			const updateVal = mockTestCase({ requirement: '' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getRequirements()).toEqual('original reqs');

			await tc1.setRequirements();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ requirement: '' }
			]);

			expect(tc1.getRequirements()).toEqual('');
		});

		it('Can set a new extra link value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				extra_link: 'original link' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: 'new link'
			});
			const updateVal = mockTestCase({ extra_link: 'new link' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getExtraLink()).toEqual('original link');

			await tc1.setExtraLink('new link');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ extra_link: 'new link' }
			]);

			expect(tc1.getExtraLink()).toEqual('new link');
		});

		it('Can erase existing extra link value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				extra_link: 'original link' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: ''
			});
			const updateVal = mockTestCase({ extra_link: '' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getExtraLink()).toEqual('original link');

			await tc1.setExtraLink();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ extra_link: '' }
			]);

			expect(tc1.getExtraLink()).toEqual('');
		});

		it('Can set a new reference link value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				extra_link: 'original link' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: 'new link'
			});
			const updateVal = mockTestCase({ extra_link: 'new link' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getReferenceLink()).toEqual('original link');

			await tc1.setReferenceLink('new link');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ extra_link: 'new link' }
			]);

			expect(tc1.getReferenceLink()).toEqual('new link');
		});

		it('Can erase existing reference link value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				extra_link: 'original link' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				extra_link: ''
			});
			const updateVal = mockTestCase({ extra_link: '' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getReferenceLink()).toEqual('original link');

			await tc1.setReferenceLink();
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ extra_link: '' }
			]);

			expect(tc1.getReferenceLink()).toEqual('');
		});

		it('Can set a new summary value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				summary: 'original test case name' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				summary: 'new name'
			});
			const updateVal = mockTestCase({ summary: 'new name' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getSummary()).toEqual('original test case name');

			await tc1.setSummary('new name');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ summary: 'new name' }
			]);

			expect(tc1.getSummary()).toEqual('new name');
		});

		it('Can set a new title value', async () => {
			const tc1 = new TestCase(mockTestCase({ 
				summary: 'original test case name' 
			}));
			const updateResponse = mockTestCaseUpdateResponse({
				summary: 'new name'
			});
			const updateVal = mockTestCase({ summary: 'new name' });

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: updateResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tc1.getTitle()).toEqual('original test case name');

			await tc1.setTitle('new name');
			verifyRpcCall(mockAxios, 0, 'TestCase.update', [
				1,
				{ summary: 'new name' }
			]);

			expect(tc1.getTitle()).toEqual('new name');
		});
	});
});
