import { describe, it, expect } from '@jest/globals';
import TestExecution from './testExecution';
import TestCase from '../testCases/testCase';
import TestRun from './testRun';
import Build from '../management/build';
import TestExecutionStatus from './testExecutionStatus';
import User from '../management/user';
import { 
	mockBuild, 
	mockTestCase, 
	mockTestExecution,
	mockTestExecutionStatus, 
	mockTestRun,
	mockUser 
} from '../../test/mockKiwiValues';
import { TestExecutionWriteValues } from './testExecution.type';
import TimeUtils from '../utils/timeUtils';
import {
	mockTestExecutionComment
} from '../../test/mockValues/comments/mockComment';
import Comment from '../comments/comment';
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

describe('Test Execution', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	const execution1Vals = mockTestExecution();
	const execution2Vals = mockTestExecution({
		id: 2,
		tested_by: 1,
		tested_by__username: 'alice',
		case_text_version: 3,
		start_date: '2023-01-08T16:40:43.078',
		stop_date: '2023-01-08T16:41:28.001',
		sortkey: 20,
		case: 2,
		case__summary: 'The second test case',
		status: 4,
		status__name: 'PASSED',
		expected_duration: 120,
		actual_duration: 184
	});
	const execution3Vals = mockTestExecution({
		id: 3,
		assignee: null,
		assignee__username: null,
		tested_by: null,
		tested_by__username: null,
		case_text_version: 6,
		sortkey: 50,
		run: 4,
		case: 2,
		case__summary: 'The second test case',
		build: 2,
		build__name: 'Build2',
		status: 5,
		status__name: 'FAILED',
		expected_duration: 60,
		actual_duration: 45
	});
	
	const user1Vals = mockUser();
	const user2Vals = mockUser({
		id: 2,
		email: 'bob@example.com',
		username: 'bob',
		first_name: 'Bob',
		last_name: 'Bar',
		is_staff: false,
		is_superuser: false
	});

	it('Can instantiate a TestExecution', () => {
		const te1 = new TestExecution(execution1Vals);
		const te2 = new TestExecution(execution2Vals);
		expect(te1['serialized']).toEqual(execution1Vals);
		expect(te2['serialized']).toEqual(execution2Vals);
	});

	describe('Access local properties', () => {

		const te1 = new TestExecution(execution1Vals);
		const te2 = new TestExecution(execution2Vals);
		const te3 = new TestExecution(execution3Vals);

		it('Can get TestExecution ID', () => {
			expect(te1.getId()).toEqual(1);
			expect(te2.getId()).toEqual(2);
			expect(te3.getId()).toEqual(3);
		});

		it('Can get TestExecution Assignee ID', () => {
			expect(te1.getAssigneeId()).toEqual(1);
			expect(te2.getAssigneeId()).toEqual(1);
			expect(te3.getAssigneeId()).toBeNull();
		});

		it('Can get TestExecution Assignee Username', () => {
			expect(te1.getAssigneeUsername()).toEqual('alice');
			expect(te2.getAssigneeUsername()).toEqual('alice');
			expect(te3.getAssigneeUsername()).toBeNull();
		});

		it('Can get TestExecution Assignee', async () => {
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [user1Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [user1Vals]
			}));
			const alice = new User(user1Vals);

			expect(await te1.getAssignee()).toEqual(alice);
			expect(await te2.getAssignee()).toEqual(alice);
			expect(await te3.getAssignee()).toBeNull();
		});

		it('Can get TestExecution Last Tester ID', () => {
			expect(te1.getLastTesterId()).toEqual(2);
			expect(te2.getLastTesterId()).toEqual(1);
			expect(te3.getLastTesterId()).toBeNull();
		});

		it('Can get TestExecution Last Tester Username', () => {
			expect(te1.getLastTesterName()).toEqual('bob');
			expect(te2.getLastTesterName()).toEqual('alice');
			expect(te3.getLastTesterName()).toBeNull();
		});

		it('Can get TestExecution Last Tester', async () => {
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [user2Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [user1Vals]
			}));

			const alice = new User(user1Vals);
			const bob = new User(user2Vals);

			expect(await te1.getLastTester()).toEqual(bob);
			expect(await te2.getLastTester()).toEqual(alice);
			expect(await te3.getLastTester()).toBeNull();
		});

		it('Can get TestExecution Test Case Text Version', () => {
			expect(te1.getTestCaseVersion()).toEqual(4);
			expect(te2.getTestCaseVersion()).toEqual(3);
			expect(te3.getTestCaseVersion()).toEqual(6);
		});

		it('Can get TestExecution Start Date', () => {
			expect(te1.getStartDate()).toBeNull();
			expect(te2.getStartDate())
				.toEqual(new Date('2023-01-08T16:40:43.078Z'));
			expect(te3.getStartDate()).toBeNull();
		});

		it('Can get TestExecution Stop Date', () => {
			expect(te1.getStopDate()).toBeNull();
			expect(te2.getStopDate())
				.toEqual(new Date('2023-01-08T16:41:28.001Z'));
			expect(te3.getStopDate()).toBeNull();
		});

		it('Can get TestExecution Expected Duration', () => {
			expect(te1.getExpectedDuration()).toEqual(0.0);
			expect(te2.getExpectedDuration()).toEqual(120);
			expect(te3.getExpectedDuration()).toEqual(60);
		});

		it('Can get TestExecution Actual Duration', () => {
			expect(te1.getActualDuration()).toBeNull();
			expect(te2.getActualDuration()).toEqual(184);
			expect(te3.getActualDuration()).toEqual(45);
		});

		it('Can get TestExecution SortKey', () => {
			expect(te1.getSortKey()).toEqual(10);
			expect(te2.getSortKey()).toEqual(20);
			expect(te3.getSortKey()).toEqual(50);
		});

		it('Can get TestExecution TestRun ID', () => {
			expect(te1.getTestRunId()).toEqual(1);
			expect(te2.getTestRunId()).toEqual(1);
			expect(te3.getTestRunId()).toEqual(4);
		});

		it('Can get TestExecution TestRun', async () => {
			const run1Vals = mockTestRun();
			const run4Vals = mockTestRun({
				id: 4,
				summary: 'Test Run Four',
				notes: 'May the fourth be with you',
				build: 2,
				build__name: 'Build2'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [run1Vals]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [run1Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [run4Vals]
			}));

			const run1 = new TestRun(run1Vals);
			const run4 = new TestRun(run4Vals);

			expect(await te1.getTestRun()).toEqual(run1);
			expect(await te2.getTestRun()).toEqual(run1);
			expect(await te3.getTestRun()).toEqual(run4);
		});

		it('Can get TestExecution TestCase ID', () => {
			expect(te1.getTestCaseId()).toEqual(1);
			expect(te2.getTestCaseId()).toEqual(2);
			expect(te3.getTestCaseId()).toEqual(2);
		});

		it('Can get TestExecution TestCase Summary', () => {
			expect(te1.getTestCaseSummary()).toEqual('Example Test Case');
			expect(te2.getTestCaseSummary()).toEqual('The second test case');
			expect(te3.getTestCaseSummary()).toEqual('The second test case');
		});

		it('Can get TestExecution TestCase', async () => {
			const tc1Vals = mockTestCase();

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [tc1Vals]
			}));
				
			const testExecCase = await te1.getTestCase();
			expect(testExecCase).toEqual(new TestCase(tc1Vals));
		});

		it('Can get TestExecution Build ID', () => {
			expect(te1.getBuildId()).toEqual(1);
			expect(te2.getBuildId()).toEqual(1);
			expect(te3.getBuildId()).toEqual(2);
		});

		it('Can get TestExecution Build Name', () => {
			expect(te1.getBuildName()).toEqual('unspecified');
			expect(te2.getBuildName()).toEqual('unspecified');
			expect(te3.getBuildName()).toEqual('Build2');
		});

		it('Can get TestExecution Build', async () => {
			const build1Vals = mockBuild();
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build1Vals]
			}));

			expect(await te1.getBuild())
				.toEqual(new Build(build1Vals));
		});

		it('Can get TestExecution Status ID', () => {
			expect(te1.getStatusId()).toEqual(1);
			expect(te2.getStatusId()).toEqual(4);
			expect(te3.getStatusId()).toEqual(5);
		});

		it('Can get TestExecution Status Name', () => {
			expect(te1.getStatusName()).toEqual('IDLE');
			expect(te2.getStatusName()).toEqual('PASSED');
			expect(te3.getStatusName()).toEqual('FAILED');
		});

		it('Can get TestExecution Status', async () => {
			
			const idleValues = mockTestExecutionStatus();
			const passedValues = mockTestExecutionStatus({
				id: 4,
				name: 'PASSED',
				weight: 10,
				icon: 'fa circle',
				color: '#72767b'
			});
			const failedValues = mockTestExecutionStatus({
				id: 5,
				name: 'FAILED',
				weight: -10,
				icon: 'fa circle',
				color: '#72767b'
			});
			
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [idleValues]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [passedValues]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [failedValues]
			}));

			expect(await te1.getStatus())
				.toEqual(new TestExecutionStatus(idleValues));
			expect(await te2.getStatus())
				.toEqual(new TestExecutionStatus(passedValues));
			expect(await te3.getStatus())
				.toEqual(new TestExecutionStatus(failedValues));
		});

	});

	describe('Update TestExecution Properties', () => {
		it('Can update TestExecution values', async () => {
			const te1 = new TestExecution(mockTestExecution({
				assignee: 1,
				assignee__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				assignee: 2
			};
			const updateVal = mockTestExecution({
				assignee: 2,
				assignee__username: 'bob'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getAssigneeId()).toEqual(1);
			expect(te1.getAssigneeUsername()).toEqual('alice');

			await te1.serverUpdate(changeVal);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getAssigneeId()).toEqual(2);
			expect(te1.getAssigneeUsername()).toEqual('bob');
		});

		it('Can set TestExecution Start Date', async () => {
			const te1 = new TestExecution(mockTestExecution({
				start_date: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				start_date: '2023-08-24T08:13:54.123'
			};
			const updateVal = mockTestExecution({
				start_date: '2023-08-24T08:13:54.123'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStartDate()).toBeNull();

			await te1.setStartDate(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStartDate()).toEqual(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
		});

		it('Can update TestExecution Start Date', async () => {
			const te1 = new TestExecution(mockTestExecution({
				start_date: '2022-05-18T03:14:34.500'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				start_date: '2023-08-24T08:13:54.123'
			};
			const updateVal = mockTestExecution({
				start_date: '2023-08-24T08:13:54.123'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStartDate()).toEqual(
				TimeUtils.serverStringToDate('2022-05-18T03:14:34.500')
			);

			await te1.setStartDate(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStartDate()).toEqual(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
		});

		it('Can remove TestExecution Start Date', async () => {
			const te1 = new TestExecution(mockTestExecution({
				start_date: '2022-05-18T03:14:34.500'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				start_date: null
			};
			const updateVal = mockTestExecution({
				start_date: null
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStartDate()).toEqual(
				TimeUtils.serverStringToDate('2022-05-18T03:14:34.500')
			);

			await te1.setStartDate();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStartDate()).toBeNull();
		});

		it('Can set TestExecution Stop Date', async () => {
			const te1 = new TestExecution(mockTestExecution({
				stop_date: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				stop_date: '2023-08-24T08:13:54.123'
			};
			const updateVal = mockTestExecution({
				stop_date: '2023-08-24T08:13:54.123'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStopDate()).toBeNull();

			await te1.setStopDate(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStopDate()).toEqual(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
		});

		it('Can update TestExecution Stop Date', async () => {
			const te1 = new TestExecution(mockTestExecution({
				stop_date: '2022-05-18T03:14:34.500'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				stop_date: '2023-08-24T08:13:54.123'
			};
			const updateVal = mockTestExecution({
				stop_date: '2023-08-24T08:13:54.123'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStopDate()).toEqual(
				TimeUtils.serverStringToDate('2022-05-18T03:14:34.500')
			);

			await te1.setStopDate(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStopDate()).toEqual(
				TimeUtils.serverStringToDate('2023-08-24T08:13:54.123')
			);
		});

		it('Can remove TestExecution Stop Date', async () => {
			const te1 = new TestExecution(mockTestExecution({
				stop_date: '2022-05-18T03:14:34.500'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				stop_date: null
			};
			const updateVal = mockTestExecution({
				stop_date: null
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStopDate()).toEqual(
				TimeUtils.serverStringToDate('2022-05-18T03:14:34.500')
			);

			await te1.setStopDate();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStopDate()).toBeNull();
		});

		it('Can set TestExecution Last Tester by ID', async () => {
			const te1 = new TestExecution(mockTestExecution({
				tested_by: null,
				tested_by__username: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				tested_by: 1
			};
			const updateVal = mockTestExecution({
				tested_by: 1,
				tested_by__username: 'alice'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getLastTesterId()).toBeNull();
			expect(te1.getLastTesterName()).toBeNull();

			await te1.setLastTester(1);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getLastTesterId()).toEqual(1);
			expect(te1.getLastTesterName()).toEqual('alice');
		});

		it('Can set TestExecution Last Tester by User', async () => {
			const te1 = new TestExecution(mockTestExecution({
				tested_by: null,
				tested_by__username: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				tested_by: 1
			};
			const updateVal = mockTestExecution({
				tested_by: 1,
				tested_by__username: 'alice'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getLastTesterId()).toBeNull();
			expect(te1.getLastTesterName()).toBeNull();

			const user1 = new User(mockUser());
			await te1.setLastTester(user1);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getLastTesterId()).toEqual(1);
			expect(te1.getLastTesterName()).toEqual('alice');
		});

		it('Can remove TestExecution Last Tester', async () => {
			const te1 = new TestExecution(mockTestExecution({
				tested_by: 1,
				tested_by__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				tested_by: null
			};
			const updateVal = mockTestExecution({
				tested_by: null,
				tested_by__username: null
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getLastTesterId()).toEqual(1);
			expect(te1.getLastTesterName()).toEqual('alice');

			await te1.setLastTester();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getLastTesterId()).toBeNull();
			expect(te1.getLastTesterName()).toBeNull();
		});

		it('Can update TestExecution Last Tester by ID', async () => {
			const te1 = new TestExecution(mockTestExecution({
				tested_by: 1,
				tested_by__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				tested_by: 2
			};
			const updateVal = mockTestExecution({
				tested_by: 2,
				tested_by__username: 'bob'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getLastTesterId()).toEqual(1);
			expect(te1.getLastTesterName()).toEqual('alice');

			await te1.setLastTester(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getLastTesterId()).toEqual(2);
			expect(te1.getLastTesterName()).toEqual('bob');
		});

		it('Can update TestExecution Last Tester by User', async () => {
			const te1 = new TestExecution(mockTestExecution({
				tested_by: 1,
				tested_by__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				tested_by: 2
			};
			const updateVal = mockTestExecution({
				tested_by: 2,
				tested_by__username: 'bob'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getLastTesterId()).toEqual(1);
			expect(te1.getLastTesterName()).toEqual('alice');

			const user2 = new User(mockUser({ id: 2, username: 'bob' }));
			await te1.setLastTester(user2);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getLastTesterId()).toEqual(2);
			expect(te1.getLastTesterName()).toEqual('bob');
		});

		it('Can set TestExecution Assignee by ID', async () => {
			const te1 = new TestExecution(mockTestExecution({
				assignee: null,
				assignee__username: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				assignee: 1
			};
			const updateVal = mockTestExecution({
				assignee: 1,
				assignee__username: 'alice'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getAssigneeId()).toBeNull();
			expect(te1.getAssigneeUsername()).toBeNull();

			await te1.setAssignee(1);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getAssigneeId()).toEqual(1);
			expect(te1.getAssigneeUsername()).toEqual('alice');
		});

		it('Can set TestExecution Assignee by User', async () => {
			const te1 = new TestExecution(mockTestExecution({
				assignee: null,
				assignee__username: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				assignee: 1
			};
			const updateVal = mockTestExecution({
				assignee: 1,
				assignee__username: 'alice'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getAssigneeId()).toBeNull();
			expect(te1.getAssigneeUsername()).toBeNull();

			const user1 = new User(mockUser());
			await te1.setAssignee(user1);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getAssigneeId()).toEqual(1);
			expect(te1.getAssigneeUsername()).toEqual('alice');
		});

		it('Can remove TestExecution Assignee', async () => {
			const te1 = new TestExecution(mockTestExecution({
				assignee: 1,
				assignee__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				assignee: null
			};
			const updateVal = mockTestExecution({
				assignee: null,
				assignee__username: null
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getAssigneeId()).toEqual(1);
			expect(te1.getAssigneeUsername()).toEqual('alice');

			await te1.setAssignee();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getAssigneeId()).toBeNull();
			expect(te1.getAssigneeUsername()).toBeNull();
		});

		it('Can update TestExecution Assignee by ID', async () => {
			const te1 = new TestExecution(mockTestExecution({
				assignee: 1,
				assignee__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				assignee: 2
			};
			const updateVal = mockTestExecution({
				assignee: 2,
				assignee__username: 'bob'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getAssigneeId()).toEqual(1);
			expect(te1.getAssigneeUsername()).toEqual('alice');

			await te1.setAssignee(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getAssigneeId()).toEqual(2);
			expect(te1.getAssigneeUsername()).toEqual('bob');
		});

		it('Can update TestExecution Assignee by User', async () => {
			const te1 = new TestExecution(mockTestExecution({
				assignee: 1,
				assignee__username: 'alice'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				assignee: 2
			};
			const updateVal = mockTestExecution({
				assignee: 2,
				assignee__username: 'bob'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getAssigneeId()).toEqual(1);
			expect(te1.getAssigneeUsername()).toEqual('alice');

			const user2 = new User(mockUser({ id: 2, username: 'bob' }));
			await te1.setAssignee(user2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getAssigneeId()).toEqual(2);
			expect(te1.getAssigneeUsername()).toEqual('bob');
		});

		it('Can update TestExecution Status by ID', async () => {
			const te1 = new TestExecution(mockTestExecution({
				status: 1,
				status__name: 'IDLE'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				status: 4,
			};
			const updateVal = mockTestExecution({
				status: 4,
				status__name: 'PASSED'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStatusId()).toEqual(1);
			expect(te1.getStatusName()).toEqual('IDLE');

			await te1.setStatus(4);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStatusId()).toEqual(4);
			expect(te1.getStatusName()).toEqual('PASSED');
		});

		/* eslint-disable-next-line max-len */
		it('Can update TestExecution Status by TestExecutionStatus', async () => {
			const te1 = new TestExecution(mockTestExecution({
				status: 1,
				status__name: 'IDLE'
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				status: 4,
			};
			const updateVal = mockTestExecution({
				status: 4,
				status__name: 'PASSED'
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStatusId()).toEqual(1);
			expect(te1.getStatusName()).toEqual('IDLE');

			const status4 = new TestExecutionStatus(mockTestExecutionStatus({
				id: 4,
				name: 'PASSED'
			}));
			await te1.setStatus(status4);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getStatusId()).toEqual(4);
			expect(te1.getStatusName()).toEqual('PASSED');
		});

		it('Can update TestExecution Status by Name', async () => {
			const te1 = new TestExecution(mockTestExecution({
				status: 1,
				status__name: 'IDLE',
				tested_by: null,
				tested_by__username: null,
				stop_date: null
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				status: 4,
			};
			const updateVal = mockTestExecution({
				status: 4,
				status__name: 'PASSED',
				tested_by: 1,
				tested_by__username: 'alice',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTestExecutionStatus({
						id: 4,
						name: 'PASSED'
					})
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getStatusId()).toEqual(1);
			expect(te1.getStatusName()).toEqual('IDLE');
			// Changing status has side effects
			expect(te1.getLastTesterId()).toBeNull();
			expect(te1.getLastTesterName()).toBeNull();
			expect(te1.getStopDate()).toBeNull();

			await te1.setStatus('PASSED');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecutionStatus.filter',
				params: [{ name: 'PASSED' }],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 1,
			});

			expect(te1.getStatusId()).toEqual(4);
			expect(te1.getStatusName()).toEqual('PASSED');
			// Changing status has side effects
			expect(te1.getLastTesterId()).toEqual(1);
			expect(te1.getLastTesterName()).toEqual('alice');
			// Kiwi 12.2 stopped updating stop_date
			expect(te1.getStopDate()).toBeNull();
		});

		it('Can set TestExecution SortKey', async () => {
			const te1 = new TestExecution(mockTestExecution({
				sortkey: 10
			}));
			const changeVal: Partial<TestExecutionWriteValues> = {
				sortkey: 20
			};
			const updateVal = mockTestExecution({
				sortkey: 20,
			});

			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: updateVal
			}));

			expect(te1.getSortKey()).toEqual(10);

			await te1.setSortKey(20);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.update',
				params: [1, changeVal],
				callIndex: 0,
			});

			expect(te1.getSortKey()).toEqual(20);
		});
	});

	describe('Relational Data', () => {
		it('Can get Comments for a TestExecution', async () => {
			const commentVal = mockTestExecutionComment();
			const te1 = new TestExecution(mockTestExecution());
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [commentVal]
			}));
			expect(await te1.getComments()).toEqual([new Comment(commentVal)]);
		});

		it('Can add a Comment to TestExecution', async () => {
			const te = new TestExecution(mockTestExecution());
			const commentValue = mockTestExecutionComment({
				comment: 'Sample Comment'
			});
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: commentValue
			}));
			const result = await te.addComment('Sample Comment');
			expect(result).toEqual(new Comment(commentValue));
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.add_comment',
				params: [1, 'Sample Comment'],
			});
		});

		it('Can remove a Comment from TestExecution by ID', async () => {
			const te = new TestExecution(mockTestExecution());
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: null
			}));
			const result = await te.removeComment(2);
			expect(result).toEqual(undefined);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.remove_comment',
				params: [1, 2],
			});
		});

		it('Can remove a Comment from TestExecution by Comment', async () => {
			const te = new TestExecution(mockTestExecution());
			const commentValue = mockTestExecutionComment({
				id: 2,
				comment: 'Sample Comment'
			});
			const comment2 = new Comment(commentValue);
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: null
			}));
			const result = await te.removeComment(comment2);
			expect(result).toEqual(undefined);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.remove_comment',
				params: [1, 2],
			});
		});

		it('Can remove all Comments from TestCase', async () => {
			const te = new TestExecution(mockTestExecution());
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: null
			}));
			const result = await te.removeAllComments();
			expect(result).toEqual(undefined);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.remove_comment',
				params: [1, null],
			});
		});
	});

	describe('Fetch values from server', () => {
		it('Can get a single TestExecution by ID', async () => {
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [execution1Vals]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [execution2Vals]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [execution3Vals]
			}));

			expect(await TestExecution.getById(1))
				.toEqual(new TestExecution(execution1Vals));
			expect(await TestExecution.getById(2))
				.toEqual(new TestExecution(execution2Vals));
			expect(await TestExecution.getById(3))
				.toEqual(new TestExecution(execution3Vals));
		});

		it('Can get multiple TestExecutions by ID', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					execution1Vals, 
					execution2Vals, 
					execution3Vals
				]
			}));
			expect(await TestExecution.getByIds([1, 2, 3]))
				.toEqual(expect.arrayContaining([
					new TestExecution(execution1Vals),
					new TestExecution(execution2Vals),
					new TestExecution(execution3Vals)
				]));
		});

		/* eslint-disable max-len */
		it('Throws an error when fetching a TestExecution by ID that does not exist', 
			async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: []
				}));
				expect(TestExecution.getById(5000))
					.rejects
					.toThrowError('Could not find any TestExecution with ID 5000');
			});
		/* eslint-enable max-len */

		it('Can get TestExecution by filtering arbitrary data', 
			async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: [execution1Vals]
				}));
				expect(await TestExecution.serverFilter({ run: 1, case: 1 }))
					.toEqual([new TestExecution(execution1Vals)]);
			});
		
		it('Can get TestExecutions by a TestCase ID', async () => {
			const teVals = [
				mockTestExecution({ id: 3, case: 5, run: 1 }),
				mockTestExecution({ id: 32, case: 5, run: 2 }),
				mockTestExecution({ id: 145, case: 5, run: 4 }),
			];
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: teVals
			}));
			const testExecs = await TestExecution.getFromTestCase(5);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ case : 5 }],
				callIndex: 0,
			});
			expect(Array.isArray(testExecs)).toBe(true);
			expect(testExecs.length).toBe(3);

			expect(testExecs[0].getId()).toBe(3);
			expect(testExecs[0].getTestCaseId()).toBe(5);
			expect(testExecs[0].getTestRunId()).toBe(1);

			expect(testExecs[1].getId()).toBe(32);
			expect(testExecs[1].getTestCaseId()).toBe(5);
			expect(testExecs[1].getTestRunId()).toBe(2);

			expect(testExecs[2].getId()).toBe(145);
			expect(testExecs[2].getTestCaseId()).toBe(5);
			expect(testExecs[2].getTestRunId()).toBe(4);
		});
		
		it('Can get TestExecutions by a TestCase object', async () => {
			const teVals = [
				mockTestExecution({ id: 3, case: 5, run: 1 }),
				mockTestExecution({ id: 32, case: 5, run: 2 }),
				mockTestExecution({ id: 145, case: 5, run: 4 }),
			];
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: teVals
			}));
			const tc = new TestCase(mockTestCase({ id: 5 }));
			const testExecs = await TestExecution.getFromTestCase(tc);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ case : 5 }],
				callIndex: 0,
			});
			expect(Array.isArray(testExecs)).toBe(true);
			expect(testExecs.length).toBe(3);

			expect(testExecs[0].getId()).toBe(3);
			expect(testExecs[0].getTestCaseId()).toBe(5);
			expect(testExecs[0].getTestRunId()).toBe(1);

			expect(testExecs[1].getId()).toBe(32);
			expect(testExecs[1].getTestCaseId()).toBe(5);
			expect(testExecs[1].getTestRunId()).toBe(2);

			expect(testExecs[2].getId()).toBe(145);
			expect(testExecs[2].getTestCaseId()).toBe(5);
			expect(testExecs[2].getTestRunId()).toBe(4);
		});
	});

	it('Can delete a TestExecution from the server', async () => {
		const te = new TestExecution(mockTestExecution({
			id: 4,
			case: 3,
			case__summary: 'Test removal of TestExecutions',
		}));
		mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
			result: null,
		}));
		await te.delete();
		assertPostRequestData({
			mockPostRequest,
			method: 'TestExecution.remove',
			params: [{ id: 4 }],
			callIndex: 0,
		});
	});
});
