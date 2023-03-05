import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import TestRun from './testRun';
import type { TestRunValues } from './testRun.type';
import type { TestPlanValues } from '../testPlans/testPlan.type';
import TestPlan from '../testPlans/testPlan';
import type { ProductValues } from '../management/product.type';
import Product from '../management/product';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Run', () => {
	// Raw Values
	const run1Vals: TestRunValues = {
		id: 1,
		plan__product_version: 1,
		plan__product_version__value: 'unspecified',
		start_date: null,
		stop_date: null,
		planned_start: '2023-01-04T00:00:00',
		planned_stop: '2023-01-05T00:00:00',
		summary: 'The First Test Run',
		notes: 'This is an example test run',
		plan: 1,
		plan__product: 1,
		plan__name: 'The First Test Plan',
		build: 1,
		build__name: 'unspecified',
		manager: 1,
		manager__username: 'Alice',
		default_tester: 2,
		default_tester__username: 'Bob'
	};

	const run2Vals: TestRunValues = {
		... run1Vals,
		id: 2,
		summary: 'Run 2',
		plan: 3,
		plan__name: 'The Third Plan',
		default_tester: null,
		default_tester__username: null
	};

	const run3Vals: TestRunValues = {
		... run1Vals,
		id: 3,
		summary: 'Run 3',
		start_date: '2023-01-04T08:47:00',
		stop_date: '2023-01-04T08:53:30',
		planned_start: null,
		planned_stop: null,
		manager: 3,
		manager__username: 'Charlie',
		default_tester: 3,
		default_tester__username: 'Charlie'
	};

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
			expect(tr1.getManagerUsername()).toEqual('Alice');
			expect(tr2.getManagerUsername()).toEqual('Alice');
			expect(tr3.getManagerUsername()).toEqual('Charlie');
		});

		it('Can get TestPlan Default Tester ID', () => {
			expect(tr1.getDefaultTesterId()).toEqual(2);
			expect(tr2.getDefaultTesterId()).toBeNull();
			expect(tr3.getDefaultTesterId()).toEqual(3);
		});

		it('Can get TestRun Default Tester Username', () => {
			expect(tr1.getDefaultTesterUsername()).toEqual('Bob');
			expect(tr2.getDefaultTesterUsername()).toBeNull();
			expect(tr3.getDefaultTesterUsername()).toEqual('Charlie');
		});

		it('Can get TestRun Plan', async () => {
			const planVals: TestPlanValues = {
				id: 1,
				name: '',
				text: '',
				create_date: '',
				is_active: true,
				extra_link: null,
				product: 1,
				product__name: 'Example.com Website',
				product_version: 1,
				product_version__value: 'unspecified',
				author: 1,
				author__username: 'Alice',
				type: 1,
				type__name: 'Unit',
				parent: null
			};

			const expectedTestPlan = new TestPlan(planVals);
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [planVals]}));
			expect(await tr1.getPlan()).toEqual(expectedTestPlan);
		});

		it('Can get TestRun Product', async () => {
			const productVals: ProductValues = {
				id: 1,
				name: 'Example.com Website',
				description: 'An example product',
				classification: 1
			};
			const expectedProduct = new Product(productVals);
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [productVals]}));
			expect(await tr1.getProduct()).toEqual(expectedProduct);
		});
	});
});
