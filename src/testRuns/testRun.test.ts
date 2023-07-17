import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import TestRun from './testRun';
import TestPlan from '../testPlans/testPlan';
import Product from '../management/product';
import User from '../management/user';
import { 
	mockProduct, 
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
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import TimeUtils from '../utils/timeUtils';
import TestCase from '../testCases/testCase';
import TestExecution from './testExecution';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [user1Vals] })
			);

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
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [user2Vals] })
			);

			expect(await tr1.getDefaultTester())
				.toEqual(new User(user2Vals));
			expect(await tr2.getDefaultTester()).toBeNull();
		});

		it('Can get TestRun Plan', async () => {
			const planVals = mockTestPlan();
			const expectedTestPlan = new TestPlan(planVals);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [planVals] })
			);
			expect(await tr1.getPlan()).toEqual(expectedTestPlan);
		});

		it('Can get TestRun Product', async () => {
			const productVals = mockProduct();
			const expectedProduct = new Product(productVals);
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [productVals] })
			);
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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getTitle()).toEqual('Original summary');
			expect(tr1.getNotes()).toEqual('Original notes');

			await tr1.serverUpdate(changeVal);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getSummary()).toEqual('Original summary');

			await tr1.setSummary('New summary');
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getTitle()).toEqual('Original summary');

			await tr1.setTitle('New summary');
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getName()).toEqual('Original summary');

			await tr1.setName('New summary');
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getNotes()).toEqual('Original notes');

			await tr1.setNotes('New notes');
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getNotes()).toEqual('Original notes');

			await tr1.setNotes();
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getDescription()).toEqual('Original notes');

			await tr1.setDescription('New notes');
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			expect(tr1.getDescription()).toEqual('Original notes');

			await tr1.setDescription();
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStartDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setPlannedStartDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStartDate()).toEqual(oldDate);

			await tr1.setPlannedStartDate();
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStopDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setPlannedStopDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getPlannedStopDate()).toEqual(oldDate);

			await tr1.setPlannedStopDate();
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStartDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setStartDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getActualStartDate()).toEqual(oldDate);

			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setActualStartDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));

			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStartDate()).toEqual(oldDate);

			await tr1.setStartDate();
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);

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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStopDate()).toEqual(oldDate);
		
			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setStopDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getActualStopDate()).toEqual(oldDate);
		
			const newDate = TimeUtils
				.serverStringToDate('2023-08-26T12:00:00.000');
			await tr1.setActualStopDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			const oldDate = TimeUtils
				.serverStringToDate('2023-08-13T14:23:43.874');
			expect(tr1.getStopDate()).toEqual(oldDate);
		
			await tr1.setStopDate();
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getManagerId()).toEqual(1);
			expect(tr1.getManagerUsername()).toEqual('alice');
		
			await tr1.setManager(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getManagerId()).toEqual(1);
			expect(tr1.getManagerUsername()).toEqual('alice');
		
			const newManager = new User(mockUser({
				id: 2,
				username: 'bob'
			}));
			await tr1.setManager(newManager);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getDefaultTesterId()).toEqual(1);
			expect(tr1.getDefaultTesterUsername()).toEqual('alice');
		
			await tr1.setDefaultTester(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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
		
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestRunUpdateResponse(changeVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ updateVal ]
			}));
		
			expect(tr1.getDefaultTesterId()).toEqual(1);
			expect(tr1.getDefaultTesterUsername()).toEqual('alice');
		
			const newTester = new User(mockUser({
				id: 2,
				username: 'bob'
			}));
			await tr1.setDefaultTester(newTester);
			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.update',
				[ 1, changeVal ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[{ id: tr1.getId() }]
			);
		
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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: createResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ runVals ]
			}));

			const newRun = await TestRun.create(createVals);

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.create',
				[ createVals ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[ { id__in: [8] } ]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: createResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ runVals ]
			}));

			const newRun = await TestRun.create(createVals);

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.create',
				[ createVals ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestRun.filter',
				[ { id__in: [8] } ]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
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
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: testCaseValues
			}));

			const tests = await tr1.getTestCases();

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.get_cases',
				[ 3 ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestCase.filter',
				[ { id__in: [1, 2, 30] }]
			);

			expect(tests).toContainEqual(new TestCase(testCaseValues[0]));
			expect(tests).toContainEqual(new TestCase(testCaseValues[1]));
			expect(tests).toContainEqual(new TestCase(testCaseValues[2]));
		});

		it('Can get TestCases included in empty TestRun', async () => {
			const tr1 = new TestRun(mockTestRun({ id: 3 }));

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: []
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: []
			}));

			const tests = await tr1.getTestCases();

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.get_cases',
				[ 3 ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestCase.filter',
				[ { id__in: [] }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
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
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: executionValues
			}));

			const tests = await tr1.getTestExecutions();

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.get_cases',
				[ 3 ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestExecution.filter',
				[ { id__in: [8, 9, 10] }]
			);

			expect(tests).toContainEqual(new TestExecution(executionValues[0]));
			expect(tests).toContainEqual(new TestExecution(executionValues[1]));
			expect(tests).toContainEqual(new TestExecution(executionValues[2]));
		});

		it('Can get TestExecutions included in empty TestRun', async () => {
			const tr1 = new TestRun(mockTestRun({ id: 3 }));

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: []
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: []
			}));

			const tests = await tr1.getTestExecutions();

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.get_cases',
				[ 3 ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestExecution.filter',
				[ { id__in: [] }]
			);

			expect(tests).toEqual([]);
		});

		it('Can add a TestCase to the TestRun by ID', async () => {
			const tr2 = new TestRun(mockTestRun({ id: 2 }));

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestExecutionCreateResponse({
					case: 5,
					run: 2,
					id: 14
				})
			}));

			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTestExecution({
						id: 14,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
				]
			}));

			const te14 = await tr2.addTestCase(5);

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.add_case',
				[ 2, 5 ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestExecution.filter',
				[ { id__in: [ 14 ] }]
			);

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

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestExecutionCreateResponse({
					case: 5,
					run: 2,
					id: 14
				})
			}));

			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockTestExecution({
						id: 14,
						case: 5,
						case__summary: 'Test 5',
						run: 2,
					}),
				]
			}));

			const te14 = await tr2.addTestCase(tc5);

			verifyRpcCall(
				mockAxios,
				0,
				'TestRun.add_case',
				[ 2, 5 ]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestExecution.filter',
				[ { id__in: [ 14 ] }]
			);

			expect(te14.getId()).toEqual(14);
			expect(te14.getTestCaseId()).toEqual(5);
			expect(te14.getTestRunId()).toEqual(2);
		});
	});
});
