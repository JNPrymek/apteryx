import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
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

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Execution', () => {
	
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
		status__name: 'FAILED'
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

	describe ('Access local properties', () => {

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
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user1Vals] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user1Vals] })
			);
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
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user2Vals] })
			);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [user1Vals] })
			);

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

			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [run1Vals] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [run1Vals] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [run4Vals] })
			);

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

			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [tc1Vals] })
			);
				
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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [build1Vals] })
			);

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
			
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [idleValues] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [passedValues] })
			);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [failedValues] })
			);

			expect(await te1.getStatus())
				.toEqual(new TestExecutionStatus(idleValues));
			expect(await te2.getStatus())
				.toEqual(new TestExecutionStatus(passedValues));
			expect(await te3.getStatus())
				.toEqual(new TestExecutionStatus(failedValues));
		});

	});

	describe('Fetch values from server', () => {
		it('Can get a single TestExecution by ID', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse(
				{ result: [execution1Vals] }
			));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse(
				{ result: [execution2Vals] }
			));
			mockAxios.post.mockResolvedValue(mockRpcResponse(
				{ result: [execution3Vals] }
			));

			expect(await TestExecution.getById(1))
				.toEqual(new TestExecution(execution1Vals));
			expect(await TestExecution.getById(2))
				.toEqual(new TestExecution(execution2Vals));
			expect(await TestExecution.getById(3))
				.toEqual(new TestExecution(execution3Vals));
		});

		it('Can get multiple TestExecutions by ID', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
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
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [] }
				));
				expect(TestExecution.getById(5000))
					.rejects
					.toThrowError('Could not find any TestExecution with ID 5000');
			});
		/* eslint-enable max-len */

		it('Can get TestExecution by filtering arbitrary data', 
			async () => {
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [execution1Vals] }
				));
				expect(await TestExecution.serverFilter({ run: 1, case: 1 }))
					.toEqual([new TestExecution(execution1Vals)]);
			});
	});
});
