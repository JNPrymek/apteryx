import { describe, it, expect } from '@jest/globals';
import TestRun from './testRun';
import TestPlan from '../testPlans/testPlan';
import Product from '../management/product';
import User from '../management/user';
import { 
	mockProduct,
	mockTag,
	mockTagServerEntry,
	mockTestCase,
	mockTestExecution,
	mockTestExecutionCreateResponse,
	mockTestPlan,
	mockTestRun,
	mockTestRunCaseListItem,
	mockTestRunUpdateResponse,
	mockUser
} from '../../test/mockKiwiValues';
import { 
	TestRunCreateValues,
	TestRunWriteValues
} from './testRun.type';
import TimeUtils from '../utils/timeUtils';
import TestCase from '../testCases/testCase';
import TestExecution from './testExecution';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import {
	assertPostRequestData
} from '../../test/networkMocks/assertPostRequestData';
import Tag from '../management/tag';


// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Test Run', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// Raw Values
	const run1Vals = mockTestRun();
	const run2Vals = mockTestRun({
		id: 2,
		summary: 'Run 2',
		plan: 3,
		plan__name: 'The Third Plan',
		default_tester: null,
		default_tester__username: null
	});
	const run3Vals = mockTestRun({
		id: 3,
		summary: 'Run 3',
		start_date: '2023-01-04T08:47:00',
		stop_date: '2023-01-04T08:53:30',
		planned_start: null,
		planned_stop: null,
		manager: 3,
		manager__username: 'charlie',
		default_tester: 3,
		default_tester__username: 'charlie'
	});
	
	const user1Vals = mockUser();
	const user2Vals = mockUser({
		id: 2,
		username: 'bob',
		email: 'bob@example.com',
		first_name: 'Bob',
		last_name: 'Bar',
		is_staff: false,
		is_superuser: false
	});

	it('Can instantiate a TestRun', () => {
		expect(new TestRun(run1Vals)).toBeInstanceOf(TestRun);
		expect(new TestRun(run2Vals)).toBeInstanceOf(TestRun);
		expect(new TestRun(run1Vals)['serialized']).toEqual(run1Vals);
		expect(new TestRun(run2Vals)['serialized']).toEqual(run2Vals);
	});

	describe('Access local properties', () => {
		const tr1 = new TestRun(run1Vals);
		const tr2 = new TestRun(run2Vals);
		const tr3 = new TestRun(run3Vals);

		it('Can get TestRun ID', () => {
			expect(tr1.getId()).toEqual(1);
			expect(tr2.getId()).toEqual(2);
		});

		it('Can get TestRun Summary', () => {
			expect(tr1.getSummary()).toEqual('The First Test Run');
			expect(tr2.getSummary()).toEqual('Run 2');
		});

		it('Can get TestRun Name', () => {
			expect(tr1.getName()).toEqual('The First Test Run');
			expect(tr2.getName()).toEqual('Run 2');
		});

		it('Can get TestRun Title', () => {
			expect(tr1.getTitle()).toEqual('The First Test Run');
			expect(tr2.getTitle()).toEqual('Run 2');
		});

		it('Can get TestRun Notes', () => {
			expect(tr1.getNotes()).toEqual('This is an example test run');
			expect(tr2.getNotes()).toEqual('This is an example test run');
		});

		it('Can get TestRun Description', () => {
			expect(tr1.getDescription()).toEqual('This is an example test run');
			expect(tr2.getDescription()).toEqual('This is an example test run');
		});

		it('Can get TestRun Start Date', () => {
			expect(tr1.getStartDate()).toBeNull();
			expect(tr2.getStartDate()).toBeNull();
			const expectDate = new Date('2023-01-04T08:47:00Z');
			expect(tr3.getStartDate()).toEqual(expectDate);
		});

		it('Can get TestRun Actual Start Date', () => {
			expect(tr1.getActualStartDate()).toBeNull();
			expect(tr2.getActualStartDate()).toBeNull();
			const expectDate = new Date('2023-01-04T08:47:00Z');
			expect(tr3.getActualStartDate()).toEqual(expectDate);
		});

		it('Can get TestRun Stop Date', () => {
			expect(tr1.getStopDate()).toBeNull();
			expect(tr2.getStopDate()).toBeNull();
			const expectDate = new Date('2023-01-04T08:53:30Z');
			expect(tr3.getStopDate()).toEqual(expectDate);
		});

		it('Can get TestRun Actual Stop Date', () => {
			expect(tr1.getActualStopDate()).toBeNull();
			expect(tr2.getActualStopDate()).toBeNull();
			const expectDate = new Date('2023-01-04T08:53:30Z');
			expect(tr3.getActualStopDate()).toEqual(expectDate);
		});
		
		it('Can get TestRun Planned Start Date', () => {
			const expectDate = new Date('2023-01-04T00:00:00Z');
			expect(tr1.getPlannedStartDate()).toEqual(expectDate);
			expect(tr2.getPlannedStartDate()).toEqual(expectDate);
			expect(tr3.getPlannedStartDate()).toBeNull();
		});

		it('Can get TestRun Planned Stop Date', () => {
			const expectDate = new Date('2023-01-05T00:00:00Z');
			expect(tr1.getPlannedStopDate()).toEqual(expectDate);
			expect(tr2.getPlannedStopDate()).toEqual(expectDate);
			expect(tr3.getPlannedStopDate()).toBeNull();
		});

		it('Can get TestRun TestPlan ID', () => {
			expect(tr1.getPlanId()).toEqual(1);
			expect(tr2.getPlanId()).toEqual(3);
		});

		it('Can get TestRun Plan Product', () => {
			expect(tr1.getProductId()).toEqual(1);
			expect(tr2.getProductId()).toEqual(1);
		});

		it('Can get TestRun Plan Product Version', () => {
			expect(tr1.getProductVersionId()).toEqual(1);
			expect(tr2.getProductVersionId()).toEqual(1);
		});

		it('Can get TestRun Plan Product Version Value', () => {
			expect(tr1.getProductVersionValue()).toEqual('unspecified');
			expect(tr2.getProductVersionValue()).toEqual('unspecified');
		});

		it('Can get TestRun Plan Product Version Name', () => {
			expect(tr1.getProductVersionName()).toEqual('unspecified');
			expect(tr2.getProductVersionName()).toEqual('unspecified');
		});

		it('Can get TestRun TestPlan Name', () => {
			expect(tr1.getPlanName()).toEqual('The First Test Plan');
			expect(tr2.getPlanName()).toEqual('The Third Plan');
		});

		it('Can get TestPlan Manger ID', () => {
			expect(tr1.getManagerId()).toEqual(1);
			expect(tr2.getManagerId()).toEqual(1);
			expect(tr3.getManagerId()).toEqual(3);
		});

		it('Can get TestRun Manager Username', () => {
			expect(tr1.getManagerUsername()).toEqual('alice');
			expect(tr2.getManagerUsername()).toEqual('alice');
			expect(tr3.getManagerUsername()).toEqual('charlie');
		});

		it('Can get TestPlan Manager', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [user1Vals]
			}));

			const alice = new User(user1Vals);
			expect(await tr1.getManager()).toEqual(alice);
		});

		it('Can get TestPlan Default Tester ID', () => {
			expect(tr1.getDefaultTesterId()).toEqual(2);
			expect(tr2.getDefaultTesterId()).toBeNull();
			expect(tr3.getDefaultTesterId()).toEqual(3);
		});

		it('Can get TestRun Default Tester Username', () => {
			expect(tr1.getDefaultTesterUsername()).toEqual('bob');
			expect(tr2.getDefaultTesterUsername()).toBeNull();
			expect(tr3.getDefaultTesterUsername()).toEqual('charlie');
		});

		it('Can get TestPlan Default Tester', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [user2Vals]
			}));

			expect(await tr1.getDefaultTester())
				.toEqual(new User(user2Vals));
			expect(await tr2.getDefaultTester()).toBeNull();
		});

		it('Can get TestRun Plan', async () => {
			const planVals = mockTestPlan();
			const expectedTestPlan = new TestPlan(planVals);
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [planVals]
			}));
			expect(await tr1.getPlan()).toEqual(expectedTestPlan);
		});

		it('Can get TestRun Product', async () => {
			const productVals = mockProduct();
			const expectedProduct = new Product(productVals);
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [productVals]
			}));
			expect(await tr1.getProduct()).toEqual(expectedProduct);
		});
	});

	describe('Update TestRun values', () => {
		it('Can update TestRun values', async () => {
			const tr1 = new TestRun(mockTestRun({
				summary: 'Original summary',
				notes: 'Original notes'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				summary: 'New summary',
				notes: 'New notes'
			};
			const updateVal = mockTestRun({
				summary: 'New summary',
				notes: 'New notes'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getTitle()).toEqual('Original summary');
			expect(tr1.getNotes()).toEqual('Original notes');

			await tr1.serverUpdate(changeVal);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getTitle()).toEqual('New summary');
			expect(tr1.getNotes()).toEqual('New notes');
		});

		it('Can update TestRun Summary', async () => {
			const tr1 = new TestRun(mockTestRun({
				summary: 'Original summary'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				summary: 'New summary'
			};
			const updateVal = mockTestRun({
				summary: 'New summary'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getSummary()).toEqual('Original summary');

			await tr1.setSummary('New summary');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getSummary()).toEqual('New summary');
		});

		it('Can update TestRun Title (Summary alias)', async () => {
			const tr1 = new TestRun(mockTestRun({
				summary: 'Original summary'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				summary: 'New summary'
			};
			const updateVal = mockTestRun({
				summary: 'New summary'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getTitle()).toEqual('Original summary');

			await tr1.setTitle('New summary');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getTitle()).toEqual('New summary');
		});

		it('Can update TestRun Name (Summary alias)', async () => {
			const tr1 = new TestRun(mockTestRun({
				summary: 'Original summary'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				summary: 'New summary'
			};
			const updateVal = mockTestRun({
				summary: 'New summary'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getName()).toEqual('Original summary');

			await tr1.setName('New summary');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getName()).toEqual('New summary');
		});

		it('Can update TestRun Notes', async () => {
			const tr1 = new TestRun(mockTestRun({
				notes: 'Original notes'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				notes: 'New notes'
			};
			const updateVal = mockTestRun({
				notes: 'New notes'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getNotes()).toEqual('Original notes');

			await tr1.setNotes('New notes');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getNotes()).toEqual('New notes');
		});

		it('Can delete TestRun Notes', async () => {
			const tr1 = new TestRun(mockTestRun({
				notes: 'Original notes'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				notes: ''
			};
			const updateVal = mockTestRun({
				notes: ''
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getNotes()).toEqual('Original notes');

			await tr1.setNotes();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getNotes()).toEqual('');
		});

		it('Can update TestRun Description (Notes alias)', async () => {
			const tr1 = new TestRun(mockTestRun({
				notes: 'Original notes'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				notes: 'New notes'
			};
			const updateVal = mockTestRun({
				notes: 'New notes'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getDescription()).toEqual('Original notes');

			await tr1.setDescription('New notes');
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getDescription()).toEqual('New notes');
		});

		it('Can delete TestRun Description (Notes alias)', async () => {
			const tr1 = new TestRun(mockTestRun({
				notes: 'Original notes'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				notes: ''
			};
			const updateVal = mockTestRun({
				notes: ''
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getDescription()).toEqual('Original notes');

			await tr1.setDescription();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getDescription()).toEqual('');
		});

		it('Can update TestRun Planned Start Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				planned_start: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				planned_start: '2023-08-26T12:00:00.000'
			};
			const updateVal = mockTestRun({
				planned_start: '2023-08-26T12:00:00.000'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStartDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setPlannedStartDate(newDate);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getPlannedStartDate()).toEqual(newDate);
		});

		it('Can remove TestRun Planned Start Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				planned_start: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				planned_start: ''
			};
			const updateVal = mockTestRun({
				planned_start: ''
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStartDate()).toEqual(oldDate);

			await tr1.setPlannedStartDate();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getPlannedStartDate()).toBeNull();
		});

		it('Can update TestRun Planned Stop Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				planned_stop: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				planned_stop: '2023-08-26T12:00:00.000'
			};
			const updateVal = mockTestRun({
				planned_stop: '2023-08-26T12:00:00.000'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStopDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setPlannedStopDate(newDate);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getPlannedStopDate()).toEqual(newDate);
		});

		it('Can remove TestRun Planned Stop Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				planned_stop: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				planned_stop: ''
			};
			const updateVal = mockTestRun({
				planned_stop: ''
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStopDate()).toEqual(oldDate);

			await tr1.setPlannedStopDate();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getPlannedStopDate()).toBeNull();
		});

		it('Can update TestRun Actual Start Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				start_date: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				start_date: '2023-08-26T12:00:00.000'
			};
			const updateVal = mockTestRun({
				start_date: '2023-08-26T12:00:00.000'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStartDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setStartDate(newDate);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getStartDate()).toEqual(newDate);
		});

		it('Can update TestRun Actual Start Date (alias)', async () => {
			const tr1 = new TestRun(mockTestRun({
				start_date: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				start_date: '2023-08-26T12:00:00.000'
			};
			const updateVal = mockTestRun({
				start_date: '2023-08-26T12:00:00.000'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getActualStartDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setActualStartDate(newDate);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getActualStartDate()).toEqual(newDate);
		});

		it('Can remove TestRun Actual Start Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				start_date: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				start_date: ''
			};
			const updateVal = mockTestRun({
				start_date: ''
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStartDate()).toEqual(oldDate);

			await tr1.setStartDate();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});

			expect(tr1.getStartDate()).toBeNull();
		});

		it('Can update TestRun Actual Stop Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				stop_date: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				stop_date: '2023-08-26T12:00:00.000'
			};
			const updateVal = mockTestRun({
				stop_date: '2023-08-26T12:00:00.000'
			});
		
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStopDate()).toEqual(oldDate);
		
			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setStopDate(newDate);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getStopDate()).toEqual(newDate);
		});

		it('Can update TestRun Actual Stop Date (alias)', async () => {
			const tr1 = new TestRun(mockTestRun({
				stop_date: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				stop_date: '2023-08-26T12:00:00.000'
			};
			const updateVal = mockTestRun({
				stop_date: '2023-08-26T12:00:00.000'
			});
		
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getActualStopDate()).toEqual(oldDate);
		
			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setActualStopDate(newDate);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getActualStopDate()).toEqual(newDate);
		});
		
		it('Can remove TestRun Actual Stop Date', async () => {
			const tr1 = new TestRun(mockTestRun({
				stop_date: '2023-08-13T14:23:43.874'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				stop_date: ''
			};
			const updateVal = mockTestRun({
				stop_date: ''
			});
		
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStopDate()).toEqual(oldDate);
		
			await tr1.setStopDate();
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getStopDate()).toBeNull();
		});

		it('Can update TestRun Manager by ID', async () => {
			const tr1 = new TestRun(mockTestRun({
				manager: 1,
				manager__username: 'alice'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				manager: 2
			};
			const updateVal = mockTestRun({
				manager: 2,
				manager__username: 'bob'
			});
		
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getManagerId()).toEqual(1);
			expect(tr1.getManagerUsername()).toEqual('alice');
		
			await tr1.setManager(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getManagerId()).toEqual(2);
			expect(tr1.getManagerUsername()).toEqual('bob');
		});

		it('Can update TestRun Manager by User', async () => {
			const tr1 = new TestRun(mockTestRun({
				manager: 1,
				manager__username: 'alice'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				manager: 2
			};
			const updateVal = mockTestRun({
				manager: 2,
				manager__username: 'bob'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getManagerId()).toEqual(1);
			expect(tr1.getManagerUsername()).toEqual('alice');
		
			const newManager = new User(mockUser({
				id: 2,
				username: 'bob'
			}));
			await tr1.setManager(newManager);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getManagerId()).toEqual(2);
			expect(tr1.getManagerUsername()).toEqual('bob');
		});

		it('Can update TestRun Default Tester by ID', async () => {
			const tr1 = new TestRun(mockTestRun({
				default_tester: 1,
				default_tester__username: 'alice'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				default_tester: 2
			};
			const updateVal = mockTestRun({
				default_tester: 2,
				default_tester__username: 'bob'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getDefaultTesterId()).toEqual(1);
			expect(tr1.getDefaultTesterUsername()).toEqual('alice');
		
			await tr1.setDefaultTester(2);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getDefaultTesterId()).toEqual(2);
			expect(tr1.getDefaultTesterUsername()).toEqual('bob');
		});

		it('Can update TestRun Default Tester by User', async () => {
			const tr1 = new TestRun(mockTestRun({
				default_tester: 1,
				default_tester__username: 'alice'
			}));
			const changeVal: Partial<TestRunWriteValues> = {
				default_tester: 2
			};
			const updateVal = mockTestRun({
				default_tester: 2,
				default_tester__username: 'bob'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getDefaultTesterId()).toEqual(1);
			expect(tr1.getDefaultTesterUsername()).toEqual('alice');
		
			const newTester = new User(mockUser({
				id: 2,
				username: 'bob'
			}));
			await tr1.setDefaultTester(newTester);
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.update',
				params: [1, changeVal],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id: tr1.getId() }],
				callIndex: 1,
			});
		
			expect(tr1.getDefaultTesterId()).toEqual(2);
			expect(tr1.getDefaultTesterUsername()).toEqual('bob');
		});
	});

	describe('Create TestRuns', () => {
		it('Can create TestRun with minimum values', async () => {
			const createVals: TestRunCreateValues = {
				summary: 'Example Test Run',
				plan: 4,
				manager: 2,
				build: 1
			};
			const createResponse = mockTestRunUpdateResponse({
				id: 8,
				summary: 'Example Test Run',
				plan: 4,
				manager: 2,
				build: 1
			});
			const runVals = mockTestRun({
				id: 8,
				summary: 'Example Test Run',
				plan: 4,
				plan__name: 'TestPlan 4',
				manager: 2,
				manager__username: 'bob'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: createResponse
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ runVals ]
			}));

			const newRun = await TestRun.create(createVals);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.create',
				params: [createVals],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id__in: [8] }],
				callIndex: 1,
			});

			expect(newRun).toBeInstanceOf(TestRun);
			expect(newRun.getId()).toEqual(8);
			expect(newRun.getSummary()).toEqual('Example Test Run');
			expect(newRun.getManagerId()).toEqual(2);
		});

		it('Can create TestRun with extra values', async () => {
			const createVals: TestRunCreateValues = {
				summary: 'Example Test Run',
				plan: 4,
				manager: 2,
				build: 1,
				default_tester: 1,
				notes: 'Custom description'
			};
			const createResponse = mockTestRunUpdateResponse({
				id: 8,
				summary: 'Example Test Run',
				plan: 4,
				manager: 2,
				build: 1,
				default_tester: 1,
				notes: 'Custom description'
			});
			const runVals = mockTestRun({
				id: 8,
				summary: 'Example Test Run',
				plan: 4,
				plan__name: 'TestPlan 4',
				manager: 2,
				manager__username: 'bob',
				default_tester: 1,
				default_tester__username: 'alice',
				notes: 'Custom description'
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: createResponse
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ runVals ]
			}));

			const newRun = await TestRun.create(createVals);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.create',
				params: [createVals],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.filter',
				params: [{ id__in: [8] }],
				callIndex: 1,
			});

			expect(newRun).toBeInstanceOf(TestRun);
			expect(newRun.getId()).toEqual(8);
			expect(newRun.getSummary()).toEqual('Example Test Run');
			expect(newRun.getManagerId()).toEqual(2);
			expect(newRun.getManagerUsername()).toEqual('bob');
			expect(newRun.getDefaultTesterId()).toEqual(1);
			expect(newRun.getDefaultTesterUsername()).toEqual('alice');
			expect(newRun.getDescription()).toEqual('Custom description');
		});
	});

	describe('TestRun - TestCase/Execution relations', () => {
		it('Can get TestCases included in TestRun', async () => {
			const tr1 = new TestRun(mockTestRun({ id: 3 }));
			const testCaseValues = [
				mockTestCase({ id: 1, summary: 'First Case' }),
				mockTestCase({ id: 2, summary: 'Second Case' }),
				mockTestCase({ id: 30, summary: 'TC Thirty' }),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTestRunCaseListItem(
						{ id: 1, execution_id: 8, summary: 'First Case' }
					),
					mockTestRunCaseListItem(
						{ id: 2, execution_id: 9, summary: 'Second Case' }
					),
					mockTestRunCaseListItem(
						{ id: 30, execution_id: 10, summary: 'TC Thirty' }
					),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: testCaseValues
			}));

			const tests = await tr1.getTestCases();

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.get_cases',
				params: [3],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id__in: [1, 2, 30] }],
				callIndex: 1,
			});

			expect(tests).toContainEqual(new TestCase(testCaseValues[0]));
			expect(tests).toContainEqual(new TestCase(testCaseValues[1]));
			expect(tests).toContainEqual(new TestCase(testCaseValues[2]));
		});

		it('Can get TestCases included in empty TestRun', async () => {
			const tr1 = new TestRun(mockTestRun({ id: 3 }));

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: []
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));

			const tests = await tr1.getTestCases();

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.get_cases',
				params: [3],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestCase.filter',
				params: [{ id__in: [] }],
				callIndex: 1,
			});

			expect(tests).toEqual([]);
		});

		it('Can get TestExecutions included in TestRun', async () => {
			const tr1 = new TestRun(mockTestRun({ id: 3 }));
			const executionValues = [
				mockTestExecution(
					{ id: 8, case: 1, case__summary: 'First Case' }
				),
				mockTestExecution(
					{ id: 9, case: 2, case__summary: 'Second Case' }
				),
				mockTestExecution(
					{ id: 10, case: 30, case__summary: 'TC Thirty' }
				),
			];

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTestRunCaseListItem(
						{ id: 1, execution_id: 8, summary: 'First Case' }
					),
					mockTestRunCaseListItem(
						{ id: 2, execution_id: 9, summary: 'Second Case' }
					),
					mockTestRunCaseListItem(
						{ id: 30, execution_id: 10, summary: 'TC Thirty' }
					),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: executionValues
			}));

			const tests = await tr1.getTestExecutions();

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.get_cases',
				params: [3],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ id__in: [8, 9, 10] }],
				callIndex: 1,
			});

			expect(tests).toContainEqual(new TestExecution(executionValues[0]));
			expect(tests).toContainEqual(new TestExecution(executionValues[1]));
			expect(tests).toContainEqual(new TestExecution(executionValues[2]));
		});

		it('Can get TestExecutions included in empty TestRun', async () => {
			const tr1 = new TestRun(mockTestRun({ id: 3 }));

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: []
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: []
			}));

			const tests = await tr1.getTestExecutions();

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.get_cases',
				params: [3],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ id__in: [] }],
				callIndex: 1,
			});

			expect(tests).toEqual([]);
		});

		it('Can add a TestCase to the TestRun by ID', async () => {
			const tr2 = new TestRun(mockTestRun({ id: 2 }));

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [mockTestExecutionCreateResponse({
					case: 5,
					run: 2,
					id: 14
				})]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTestExecution({
						id: 14,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
				]
			}));

			const executionList = await tr2.addTestCase(5);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.add_case',
				params: [2, 5],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ id__in: [ 14 ] }],
				callIndex: 1,
			});

			expect(executionList.length).toEqual(1);
			const te14 = executionList[0];
			expect(te14.getId()).toEqual(14);
			expect(te14.getTestCaseId()).toEqual(5);
			expect(te14.getTestRunId()).toEqual(2);
		});

		it('Can add a TestCase to the TestRun by TestCase', async () => {
			const tr2 = new TestRun(mockTestRun({ id: 2 }));
			const tc5 = new TestCase(mockTestCase({
				id: 5,
				summary: 'Test 5'
			}));

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [mockTestExecutionCreateResponse({
					case: 5,
					run: 2,
					id: 14
				})]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTestExecution({
						id: 14,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
				]
			}));

			const executionList = await tr2.addTestCase(tc5);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.add_case',
				params: [2, 5],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ id__in: [ 14 ] }],
				callIndex: 1,
			});

			expect(executionList.length).toEqual(1);
			const te14 = executionList[0];
			expect(te14.getId()).toEqual(14);
			expect(te14.getTestCaseId()).toEqual(5);
			expect(te14.getTestRunId()).toEqual(2);
		});

		it('Can add a TestCase with multiple Properties', async () => {
			const tr2 = new TestRun(mockTestRun({ id: 2 }));

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTestExecutionCreateResponse({
						case: 5,
						run: 2,
						id: 14,
						properties:[
							{
								name: 'Foo',
								value: 'Bar'
							}
						]
					}),
					mockTestExecutionCreateResponse({
						case: 5,
						run: 2,
						id: 15,
						properties:[
							{
								name: 'Foo',
								value: 'Fizz'
							}
						]
					}),
					mockTestExecutionCreateResponse({
						case: 5,
						run: 2,
						id: 16,
						properties:[
							{
								name: 'Foo',
								value: 'Buzz'
							}
						]
					}),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTestExecution({
						id: 14,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
					mockTestExecution({
						id: 15,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
					mockTestExecution({
						id: 16,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
				]
			}));

			const executionList = await tr2.addTestCase(5);

			assertPostRequestData({
				mockPostRequest,
				method: 'TestRun.add_case',
				params: [2, 5],
				callIndex: 0,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'TestExecution.filter',
				params: [{ id__in: [ 14, 15, 16 ] }],
				callIndex: 1,
			});

			expect(executionList.length).toEqual(3);

			const te14 = executionList[0];
			expect(te14.getId()).toEqual(14);
			expect(te14.getTestCaseId()).toEqual(5);
			expect(te14.getTestRunId()).toEqual(2);

			const te15 = executionList[1];
			expect(te15.getId()).toEqual(15);
			expect(te15.getTestCaseId()).toEqual(5);
			expect(te15.getTestRunId()).toEqual(2);

			const te16 = executionList[2];
			expect(te16.getId()).toEqual(16);
			expect(te16.getTestCaseId()).toEqual(5);
			expect(te16.getTestRunId()).toEqual(2);
		});
	});

	describe('TestRun - Tag relations', () => {
		it('Can list Tags from TestRun', async () => {
			const tr = new TestRun(run1Vals);
			const tagVals = [
				mockTagServerEntry({ id: 1, name: 'Tag1', run: 1 }),
				mockTagServerEntry({ id: 2, name: 'Tag2', run: 1 }),
			];
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: tagVals,
			}));
			const trTags = await tr.getTags();
			expect(trTags.length).toEqual(2);
			expect(trTags[0]).toEqual(new Tag({ id: 1, name: 'Tag1' }));
			expect(trTags[1]).toEqual(new Tag({ id: 2, name: 'Tag2' }));
		});

		it('Can add Tags to TestRun by Tag object', async () => {
			const tr = new TestRun(run1Vals);
			const tag2 = new Tag(mockTag({ id: 2, name: 'ExampleTag2' }));
			const tag3 = new Tag(mockTag({ id: 3, name: 'ExampleTag3' }));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 2, name: 'Tag2' }),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 2, name: 'Tag2' }),
					mockTag({ id: 3, name: 'Tag3' }),
				]
			}));
			await tr.addTag(tag2);
			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'TestRun.add_tag',
				params: [1, 'ExampleTag2']
			});
			await tr.addTag(tag3);
			assertPostRequestData({
				mockPostRequest,
				callIndex: 1,
				method: 'TestRun.add_tag',
				params: [1, 'ExampleTag3']
			});
		});

		it('Can add Tags to TestRun by Name', async () => {
			const tr = new TestRun(run1Vals);
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 2, name: 'Tag2' }),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 2, name: 'Tag2' }),
					mockTag({ id: 3, name: 'Tag3' }),
				]
			}));
			await tr.addTag('ExampleTag2');
			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'TestRun.add_tag',
				params: [1, 'ExampleTag2']
			});
			await tr.addTag('ExampleTag3');
			assertPostRequestData({
				mockPostRequest,
				callIndex: 1,
				method: 'TestRun.add_tag',
				params: [1, 'ExampleTag3']
			});
		});

		it('Can add Tags to TestRun by ID', async () => {
			const tr = new TestRun(run1Vals);
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ id: 2, name: 'ExampleTag2' }),
				]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 2, name: 'Tag2' }),
				]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ id: 3, name: 'ExampleTag3' }),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 2, name: 'Tag2' }),
					mockTag({ id: 3, name: 'Tag3' }),
				]
			}));

			await tr.addTag(2);

			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'Tag.filter',
				params: [{ id__in: [ 2 ] }]
			});
			assertPostRequestData({
				mockPostRequest,
				callIndex: 1,
				method: 'TestRun.add_tag',
				params: [1, 'ExampleTag2']
			});

			await tr.addTag(3);

			assertPostRequestData({
				mockPostRequest,
				callIndex: 2,
				method: 'Tag.filter',
				params: [{ id__in: [ 3 ] }]
			});
			assertPostRequestData({
				mockPostRequest,
				callIndex: 3,
				method: 'TestRun.add_tag',
				params: [1, 'ExampleTag3']
			});
		});

		it('Can remove Tags from TestRun by Tag object', async () => {
			const tr = new TestRun(run1Vals);
			const tag2 = new Tag(mockTag({ id: 2, name: 'ExampleTag2' }));
			const tag3 = new Tag(mockTag({ id: 3, name: 'ExampleTag3' }));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 3, name: 'Tag3' }),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
				]
			}));
			await tr.removeTag(tag2);
			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'TestRun.remove_tag',
				params: [1, 'ExampleTag2']
			});
			await tr.removeTag(tag3);
			assertPostRequestData({
				mockPostRequest,
				callIndex: 1,
				method: 'TestRun.remove_tag',
				params: [1, 'ExampleTag3']
			});
		});

		it('Can remove Tags from TestRun by Name', async () => {
			const tr = new TestRun(run1Vals);
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 3, name: 'Tag3' }),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
				]
			}));
			await tr.removeTag('ExampleTag2');
			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'TestRun.remove_tag',
				params: [1, 'ExampleTag2']
			});
			await tr.removeTag('ExampleTag3');
			assertPostRequestData({
				mockPostRequest,
				callIndex: 1,
				method: 'TestRun.remove_tag',
				params: [1, 'ExampleTag3']
			});
		});

		it('Can remove Tags from TestRun by ID', async () => {
			const tr = new TestRun(run1Vals);
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ id: 2, name: 'ExampleTag2' }),
				]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
					mockTag({ id: 3, name: 'Tag3' }),
				]
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [
					mockTagServerEntry({ id: 3, name: 'ExampleTag3' }),
				]
			}));
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [
					mockTag({ id: 1, name: 'Tag1' }),
				]
			}));

			await tr.removeTag(2);

			assertPostRequestData({
				mockPostRequest,
				callIndex: 0,
				method: 'Tag.filter',
				params: [{ id__in: [ 2 ] }]
			});
			assertPostRequestData({
				mockPostRequest,
				callIndex: 1,
				method: 'TestRun.remove_tag',
				params: [1, 'ExampleTag2']
			});

			await tr.removeTag(3);

			assertPostRequestData({
				mockPostRequest,
				callIndex: 2,
				method: 'Tag.filter',
				params: [{ id__in: [ 3 ] }]
			});
			assertPostRequestData({
				mockPostRequest,
				callIndex: 3,
				method: 'TestRun.remove_tag',
				params: [1, 'ExampleTag3']
			});
		});
	});
});
