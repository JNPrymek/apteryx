import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import TestExecution from './testExecution';

import type { TestExecutionValues } from './testExecution.type';
import type { TestRunValues } from './testRun.type';
import type { TestCaseValues } from '../testCases/testCase.type';
import type { BuildValues } from '../management/build.type';
import TestCase from '../testCases/testCase';
import TestRun from './testRun';
import Build from '../management/build';
import TestExecutionStatus from './testExecutionStatus';
import { TestExecutionStatusValues } from './testExecutionStatus.type';

//Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Execution', () => {
	// Raw values
	const ex1Vals: TestExecutionValues = {
		id: 1,
		assignee: 1,
		assignee__username: 'Alice',
		tested_by: 2,
		tested_by__username: 'Bob',
		case_text_version: 4,
		start_date: null,
		stop_date: '2023-01-08T16:41:28.001',
		sortkey: 10,
		run: 1,
		case: 1,
		case__summary: 'The first test case',
		build: 1,
		build__name: 'unspecified',
		status: 5,
		status__name: 'FAILED'
	};

	const ex2Vals: TestExecutionValues = {
		id: 2,
		assignee: 1,
		assignee__username: 'Alice',
		tested_by: 1,
		tested_by__username: 'Alice',
		case_text_version: 3,
		start_date: '2023-01-08T16:40:43.078',
		stop_date: '2023-01-08T16:41:28.001',
		sortkey: 20,
		run: 1,
		case: 2,
		case__summary: 'The second test case',
		build: 1,
		build__name: 'unspecified',
		status: 4,
		status__name: 'PASSED'
	};

	const ex3Vals: TestExecutionValues = {
		id: 3,
		assignee: null,
		assignee__username: null,
		tested_by: null,
		tested_by__username: null,
		case_text_version: 6,
		start_date: null,
		stop_date: null,
		sortkey: 50,
		run: 4,
		case: 2,
		case__summary: 'The second test case',
		build: 2,
		build__name: 'specified',
		status: 1,
		status__name: 'IDLE'
	};

	it('Can instantiate a TestExecution', () => {
		const te1 = new TestExecution(ex1Vals);
		const te2 = new TestExecution(ex2Vals);
		expect(te1['serialized']).toEqual(ex1Vals);
		expect(te2['serialized']).toEqual(ex2Vals);
	});

	describe ('Access local properties', () => {

		const te1 = new TestExecution(ex1Vals);
		const te2 = new TestExecution(ex2Vals);
		const te3 = new TestExecution(ex3Vals);

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
			expect(te1.getAssigneeUsername()).toEqual('Alice');
			expect(te2.getAssigneeUsername()).toEqual('Alice');
			expect(te3.getAssigneeUsername()).toBeNull();
		});

		it('Can get TestExecution Last Tester ID', () => {
			expect(te1.getLastTesterId()).toEqual(2);
			expect(te2.getLastTesterId()).toEqual(1);
			expect(te3.getLastTesterId()).toBeNull();
		});

		it('Can get TestExecution Last Tester Username', () => {
			expect(te1.getLastTesterName()).toEqual('Bob');
			expect(te2.getLastTesterName()).toEqual('Alice');
			expect(te3.getLastTesterName()).toBeNull();
		});

		it('Can get TestExecution Test Case Text Version', () => {
			expect(te1.getTestCaseVersion()).toEqual(4);
			expect(te2.getTestCaseVersion()).toEqual(3);
			expect(te3.getTestCaseVersion()).toEqual(6);
		});

		it('Can get TestExecution Start Date', () => {
			expect(te1.getStartDate()).toBeNull();
			expect(te2.getStartDate()).toEqual(new Date('2023-01-08T16:40:43.078Z'));
			expect(te3.getStartDate()).toBeNull();
		});

		it('Can get TestExecution Stop Date', () => {
			expect(te1.getStopDate()).toEqual(new Date('2023-01-08T16:41:28.001Z'));
			expect(te2.getStopDate()).toEqual(new Date('2023-01-08T16:41:28.001Z'));
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
			const run1Vals: TestRunValues = {
				id: 1,
				plan__product_version: 1,
				plan__product_version__value: 'unspecified',
				start_date: null,
				stop_date: null,
				planned_start: '2023-01-04T00:00:00',
				planned_stop: '2023-01-04T00:00:00',
				summary: 'Test Run One',
				notes: 'The first of many test runs',
				plan: 1,
				plan__product: 1,
				plan__name: 'The first test plan',
				build: 1,
				build__name: 'unspecified',
				manager: 1,
				manager__username: 'bob',
				default_tester: 1,
				default_tester__username: 'bob'
			};

			const run4Vals: TestRunValues = {
				id: 1,
				plan__product_version: 1,
				plan__product_version__value: 'unspecified',
				start_date: null,
				stop_date: null,
				planned_start: '2023-01-04T00:00:00',
				planned_stop: '2023-01-04T00:00:00',
				summary: 'Test Run Four',
				notes: 'May the fourth be with you',
				plan: 1,
				plan__product: 1,
				plan__name: 'The first test plan',
				build: 2,
				build__name: 'specified',
				manager: 1,
				manager__username: 'bob',
				default_tester: 2,
				default_tester__username: 'alice'
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({ result: [run1Vals]}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({ result: [run1Vals]}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({ result: [run4Vals]}));

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
			expect(te1.getTestCaseSummary()).toEqual('The first test case');
			expect(te2.getTestCaseSummary()).toEqual('The second test case');
			expect(te3.getTestCaseSummary()).toEqual('The second test case');
		});

		it('Can get TestExecution TestCase', async () => {
			const tcRawVal: TestCaseValues = {
				id: 1,
				is_automated: false,
				create_date: '',
				arguments: '',
				extra_link: null,
				script: '',
				summary: 'The first test case',
				requirement: null,
				notes: 'some notes',
				text: 'The first test case',
				case_status: 2,
				case_status__name: 'CONFIRMED',
				category: 1,
				category__name: '--default--',
				priority: 1,
				priority__value: 'P1',
				author: 2,
				author__username: 'bob',
				default_tester: 2,
				default_tester__username: 'bob',
				reviewer: null,
				reviewer__username: null,
				setup_duration: 60,
				testing_duration: 120,
				expected_duration: 180
			};

			// mock response
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [tcRawVal]}));
			const testExecCase = await te1.getTestCase();
			expect(testExecCase).toEqual(new TestCase(tcRawVal));
		});

		it('Can get TestExecution Build ID', () => {
			expect(te1.getBuildId()).toEqual(1);
			expect(te2.getBuildId()).toEqual(1);
			expect(te3.getBuildId()).toEqual(2);
		});

		it('Can get TestExecution Build Name', () => {
			expect(te1.getBuildName()).toEqual('unspecified');
			expect(te2.getBuildName()).toEqual('unspecified');
			expect(te3.getBuildName()).toEqual('specified');
		});

		it('Can get TestExecution Build', async () => {
			const buildValues: BuildValues = {
				id: 1,
				name: 'unspecified',
				version: 1,
				version__value: 'unspecified',
				is_active: true,
			};
			const expectedBuild = new Build(buildValues);
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [buildValues]}));
			expect(await te1.getBuild()).toEqual(expectedBuild);
		});

		it('Can get TestExecution Status ID', () => {
			expect(te1.getStatusId()).toEqual(5);
			expect(te2.getStatusId()).toEqual(4);
			expect(te3.getStatusId()).toEqual(1);
		});

		it('Can get TestExecution Status Name', () => {
			expect(te1.getStatusName()).toEqual('FAILED');
			expect(te2.getStatusName()).toEqual('PASSED');
			expect(te3.getStatusName()).toEqual('IDLE');
		});

		it('Can get TestExecution Status', async () => {
			
			const statusTypes: {
				idle: TestExecutionStatusValues,
				passed: TestExecutionStatusValues,
				failed: TestExecutionStatusValues
			} = {
				idle: {
					id: 1,
					name: 'IDLE',
					weight: 0,
					icon: 'fa circle',
					color: '#72767b'
				},
				passed: {
					id: 4,
					name: 'PASSED',
					weight: 10,
					icon: 'fa circle',
					color: '#72767b'
				},
				failed: {
					id: 5,
					name: 'FAILED',
					weight: -10,
					icon: 'fa circle',
					color: '#72767b'
				}
			}; 
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({ result: [statusTypes.idle] }));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({ result: [statusTypes.passed] }));
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [statusTypes.failed] }));

			expect(await te1.getStatus()).toEqual(new TestExecutionStatus(statusTypes.idle));
			expect(await te2.getStatus()).toEqual(new TestExecutionStatus(statusTypes.passed));
			expect(await te3.getStatus()).toEqual(new TestExecutionStatus(statusTypes.failed));
		});

	});

	describe('Fetch values from server', () => {
		it('Can get a single TestExecution by ID', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({result: [ex1Vals]}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({result: [ex2Vals]}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [ex3Vals]}));
			expect(await TestExecution.getById(1)).toEqual(new TestExecution(ex1Vals));
			expect(await TestExecution.getById(2)).toEqual(new TestExecution(ex2Vals));
			expect(await TestExecution.getById(3)).toEqual(new TestExecution(ex3Vals));
		});

		it('Can get multiple TestExecutions by ID', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [ex1Vals, ex2Vals, ex3Vals]}));
			expect(await TestExecution.getByIds([1, 2, 3])).toEqual(expect.arrayContaining([
				new TestExecution(ex1Vals),
				new TestExecution(ex2Vals),
				new TestExecution(ex3Vals)
			]));
		});

		it('Throws an error when fetching a TestExecution by ID that does not exist', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			expect(TestExecution.getById(5000)).rejects.toThrowError('Could not find any TestExecution with ID 5000');
		});

		it('Can get TestExecution by filtering arbitrary data', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [ex1Vals]}));
			expect(await TestExecution.serverFilter({run: 1, case: 1})).toEqual([new TestExecution(ex1Vals)]);
		});
	});
});