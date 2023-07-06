import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import TestRun from './testRun';
import TestPlan from '../testPlans/testPlan';
import Product from '../management/product';
import User from '../management/user';
import { 
	mockProduct, 
	mockTestPlan, 
	mockTestRun, 
	mockTestRunUpdateResponse, 
	mockUser 
} from '../../test/mockKiwiValues';
import { TestRunWriteValues } from './testRun.type';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';

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
	});
});
