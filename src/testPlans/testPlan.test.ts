import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Product from '../management/product';
import Version from '../management/version';
import TestCase from '../testCases/testCase';
import PlanType from './planType';

import TestPlan from './testPlan';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Plan', () => {

	// literals
	const plan1Vals = {
		id: 1,
		name: 'Example Tests',
		text: 'An Example Test Plan',
		create_date: '2022-12-02T20:11:13.015',
		is_active: true,
		extra_link: null,
		product_version: 1,
		product_version__value: 'Unspecified',
		product: 1,
		product__name: 'Example.com Website',
		author: 3,
		author__username: 'joe',
		type: 1,
		type__name: 'Unit',
		parent: null
	};

	const plan2Vals = {
		id: 2,
		name: 'More Example Tests',
		text: 'Another Example Test Plan',
		create_date: '2022-12-02T20:11:13.015',
		is_active: false,
		extra_link: 'This is an extra link',
		product_version: 2,
		product_version__value: 'v1.3.2',
		product: 2,
		product__name: 'ExampleApp',
		author: 3,
		author__username: 'joe',
		type: 4,
		type__name: 'Regression',
		parent: 1
	};

	const plan3Vals = {
		id: 3,
		name: 'Plan 3',
		text: 'Another Another Example Test Plan',
		create_date: '2022-12-02T20:11:13.015',
		is_active: false,
		extra_link: 'This is an extra link',
		product_version: 2,
		product_version__value: 'v1.3.2',
		product: 2,
		product__name: 'ExampleApp',
		author: 3,
		author__username: 'joe',
		type: 4,
		type__name: 'Regression',
		parent: 1
	};

	const plan4Vals = {
		id: 4,
		name: 'Plan 4',
		text: 'Nested Test Plans',
		create_date: '2022-12-02T20:12:13.015',
		is_active: false,
		extra_link: null,
		product_version: 2,
		product_version__value: 'v1.3.2',
		product: 2,
		product__name: 'ExampleApp',
		author: 3,
		author__username: 'joe',
		type: 4,
		type__name: 'Regression',
		parent: 3
	};

	const tp1 = new TestPlan(plan1Vals);
	const tp2 = new TestPlan(plan2Vals);
	const tp3 = new TestPlan(plan3Vals);
	const tp4 = new TestPlan(plan4Vals);

	it('Can instantiate a TestPlan', () => {
		const tp = new TestPlan(plan1Vals);
		expect(tp['serialized']).toEqual(plan1Vals);
	});

	describe('Can access local properties of TestPlan', () => {

		it('Can get TestPlan ID', () => {
			expect(tp1.getId()).toEqual(1);
			expect(tp2.getId()).toEqual(2);
		});

		it('Can get TestPlan Name', () => {
			expect(tp1.getName()).toEqual('Example Tests');
			expect(tp2.getName()).toEqual('More Example Tests');
		});

		it('Can get TestPlan Text', () => {
			expect(tp1.getText()).toEqual('An Example Test Plan');
			expect(tp2.getText()).toEqual('Another Example Test Plan');
		});

		it('Can get Test Plan Creation Date', () => {
			const date1 = new Date('2022-12-02T20:11:13.015Z');
			const date2 = new Date('2022-12-02T20:11:13.015Z');

			expect(tp1.getCreateDate()).toEqual(date1);
			expect(tp2.getCreateDate()).toEqual(date2);
		});

		it('Can get TestPlan is Active', () => {
			expect(tp1.isActive()).toEqual(true);
			expect(tp2.isActive()).toEqual(false);
		});

		it('Can get TestPlan is Disabled', () => {
			expect(tp1.isDisabled()).toEqual(false);
			expect(tp2.isDisabled()).toEqual(true);
		});

		it('Can get TestPlan Extra Link', () => {
			expect(tp1.getExtraLink()).toEqual(null);
			expect(tp2.getExtraLink()).toEqual('This is an extra link');
		});

		it('Can get TestPlan Product Version ID', () => {
			expect(tp1.getProductVersionId()).toEqual(1);
			expect(tp2.getProductVersionId()).toEqual(2);
		});

		it('Can get TestPlan Product Version Value', () => {
			expect(tp1.getProductVersionValue()).toEqual('Unspecified');
			expect(tp2.getProductVersionValue()).toEqual('v1.3.2');
		});

		it('Can get TestPlan Product Version', async () => {
			const prodVersionVals = {
				id: 1,
				value: 'Unspecified',
				product: 1,
				product__name: 'Example.com Website'
			};
			const prodVersion = new Version(prodVersionVals);

			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [prodVersionVals] })
				);
			const tp1ProdVersion = await tp1.getProductVersion();
			expect(tp1ProdVersion).toEqual(prodVersion);
		});

		it('Can get TestPlan Product ID', () => {
			expect(tp1.getProductId()).toEqual(1);
			expect(tp2.getProductId()).toEqual(2);
		});

		it('Can get TestPlan Product Name', () => {
			expect(tp1.getProductName()).toEqual('Example.com Website');
			expect(tp2.getProductName()).toEqual('ExampleApp');
		});

		it('Can get TestPlan Product', async () => {
			const prodVals = {
				id: 1,
				name: 'Example.com Website',
				description: 'Example Website',
				classification: 1
			};
			const product = new Product(prodVals);

			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [prodVals] }));
			const tp1Product = await tp1.getProduct();
			expect(tp1Product).toEqual(product);
		});

		it('Can get TestPlan Type ID', () => {
			expect(tp1.getTypeId()).toEqual(1);
			expect(tp2.getTypeId()).toEqual(4);
		});

		it('Can get TestPlan Type Name', () => {
			expect(tp1.getTypeName()).toEqual('Unit');
			expect(tp2.getTypeName()).toEqual('Regression');
		});

		it('Can get TestPlan Type', async () => {
			const typeVals = {
				id: 1,
				name: 'Unit',
				description: ''
			};
			const tpType = new PlanType(typeVals);

			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [typeVals] }));
			const tp1Type = await tp1.getType();
			expect(tp1Type).toEqual(tpType);
		});

		it('Can get TestPlan parent ID', () => {
			expect(tp1.getParentId()).toBeNull();
			expect(tp2.getParentId()).toEqual(1);
		});

		it('Can get TestPlan Parent', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [plan1Vals] }));
			const tp2Parent = await tp2.getParent();
			expect(tp2Parent).toEqual(tp1);
		});

		it('Can get TestPlan Parent - null parent', async () => {
			const tp1Parent = await tp1.getParent();
			expect(tp1Parent).toBeNull();
		});

	});

	describe('Basic Server Functions', () => {
		// get by name - 0, 1, multiple matches
		it('Can get TestPlan by a single ID (one match)', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [plan1Vals] }));
			const results = await TestPlan.getById(1);
			expect(results).toEqual(tp1);
		});

		it('Can get TestPlan by single ID (no match)', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [] }));
			expect(TestPlan.getById(1))
				.rejects
				.toThrowError('Could not find any TestPlan with ID 1');
		});

		it('Can get TestPlan by Name (one match)', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result:[plan1Vals] }));
			const result = await TestPlan.getByName('Example Tests');
			expect(result).toEqual(tp1);
		});

		it('Can get TestPlan by Name (0 matches)', () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			const name = 'Non-used name';
			expect(TestPlan.getByName(name))
				.rejects
				.toThrowError(
					`TestPlan with name "${name}" could not be found.`
				);
		});
	});

	describe('TestPlan -> TestCase relations', () => {
		
		const sortKeysRawResponse = {
			'1': 30,
			'2': 20,
			'3': 10,
			'4': 40
		};

		const testCaseRawValues = [
			{
				'id': 1,
				'create_date': '2022-12-02T20:13:27.697',
				'is_automated': false,
				'script': '',
				'arguments': '',
				'extra_link': null,
				'summary': 'Example Test Case p',
				'requirement': null,
				'notes': '',
				'text': '',
				'case_status': 1,
				'case_status__name': 'PROPOSED',
				'category': 1,
				'category__name': '--default--',
				'priority': 1,
				'priority__value': 'P1',
				'author': 3,
				'author__username': 'debug',
				'default_tester': null,
				'default_tester__username': null,
				'reviewer': null,
				'reviewer__username': null,
				'setup_duration': null,
				'testing_duration': null,
				'expected_duration': 0.0
			},
			{
				'id': 2,
				'create_date': '2022-12-02T20:13:40.061',
				'is_automated': false,
				'script': '',
				'arguments': '',
				'extra_link': null,
				'summary': 'Example Test Case v',
				'requirement': null,
				'notes': '',
				'text': '',
				'case_status': 1,
				'case_status__name': 'PROPOSED',
				'category': 1,
				'category__name': '--default--',
				'priority': 1,
				'priority__value': 'P1',
				'author': 3,
				'author__username': 'debug',
				'default_tester': null,
				'default_tester__username': null,
				'reviewer': null,
				'reviewer__username': null,
				'setup_duration': null,
				'testing_duration': null,
				'expected_duration': 0.0
			},
			{
				'id': 3,
				'create_date': '2022-12-02T20:13:40.912',
				'is_automated': false,
				'script': '',
				'arguments': '',
				'extra_link': null,
				'summary': 'Example Test Case n',
				'requirement': null,
				'notes': '',
				'text': '',
				'case_status': 1,
				'case_status__name': 'PROPOSED',
				'category': 1,
				'category__name': '--default--',
				'priority': 1,
				'priority__value': 'P1',
				'author': 3,
				'author__username': 'debug',
				'default_tester': null,
				'default_tester__username': null,
				'reviewer': null,
				'reviewer__username': null,
				'setup_duration': null,
				'testing_duration': null,
				'expected_duration': 0.0
			},
			{
				'id': 4,
				'create_date': '2022-12-02T20:13:41.700',
				'is_automated': false,
				'script': '',
				'arguments': '',
				'extra_link': null,
				'summary': 'Example Test Case 3',
				'requirement': null,
				'notes': '',
				'text': '',
				'case_status': 1,
				'case_status__name': 'PROPOSED',
				'category': 1,
				'category__name': '--default--',
				'priority': 1,
				'priority__value': 'P1',
				'author': 3,
				'author__username': 'debug',
				'default_tester': null,
				'default_tester__username': null,
				'reviewer': null,
				'reviewer__username': null,
				'setup_duration': null,
				'testing_duration': null,
				'expected_duration': 0.0
			}
		];

		const tcListIdSort = [
			new TestCase(testCaseRawValues[0]),
			new TestCase(testCaseRawValues[1]),
			new TestCase(testCaseRawValues[2]),
			new TestCase(testCaseRawValues[3])
		];

		const tcListKeySort = [
			tcListIdSort[2],
			tcListIdSort[1],
			tcListIdSort[0],
			tcListIdSort[3]
		];

		it('Can get list of TestCases - default order', async ()=> {
			mockAxios
				.post
				.mockResolvedValueOnce(
					mockRpcResponse({ result: sortKeysRawResponse }));
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: testCaseRawValues }));
			const planCases = await tp1.getTestCases();
			expect(planCases).toEqual(tcListKeySort);
		});

		it('Can get list of TestCases - TC ID order', async ()=> {
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: testCaseRawValues }));
			const planCases = await tp1.getTestCases('TESTCASE_ID');
			expect(planCases).toEqual(tcListIdSort);
		});

		it('Can get list of TestCases - SortKey order', async ()=> {
			mockAxios
				.post
				.mockResolvedValueOnce(
					mockRpcResponse({ result: sortKeysRawResponse }));
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: testCaseRawValues })
				);
			const planCases = await tp1.getTestCases('SORTKEY');
			expect(planCases).toEqual(tcListKeySort);
		});

		it('Can get all test plans containing a specific test case - by ID', 
			async () => {
				mockAxios
					.post
					.mockResolvedValue(
						mockRpcResponse({ result: [plan1Vals, plan3Vals] })
					);
				const tc1Plans = await TestPlan.getPlansWithTestCase(1);
				expect(tc1Plans).toEqual(expect.arrayContaining([tp1, tp3]));
				expect(tc1Plans.length).toEqual(2);
			});

		/* eslint-disable-next-line max-len */
		it('Can get all test plans containing a specific test case - by TestCase', 
			async () => {
				mockAxios
					.post
					.mockResolvedValue(
						mockRpcResponse({ result: [plan1Vals, plan3Vals] })
					);
				const tc1Plans = await TestPlan
					.getPlansWithTestCase(tcListIdSort[0]);
				expect(tc1Plans).toEqual(expect.arrayContaining([tp1, tp3]));
				expect(tc1Plans.length).toEqual(2);
			});
	});

	describe('TestPlan - TestPlan Relations', () => {
		it('TestPlan with children can return list of direct child TestPlans', 
			async () => {
				mockAxios
					.post
					.mockResolvedValue(
						mockRpcResponse({ result: [plan2Vals, plan3Vals] })
					);
				const results = await tp1.getDirectChildren();
				expect(Array.isArray(results)).toEqual(true);
				expect(results.length).toEqual(2);
				expect(results).toEqual(expect.arrayContaining([tp2, tp3]));
				expect(results).toEqual(expect.not.arrayContaining([tp1]));
			});

		it('Can check if TestPlan has children', async () => {
			mockAxios
				.post
				.mockResolvedValueOnce(
					mockRpcResponse({ result: [plan2Vals, plan3Vals] })
				);
			mockAxios
				.post
				.mockResolvedValueOnce(
					mockRpcResponse({ result: [] })
				);
			
			const tp1Children = await tp1.hasChildren(); // 2 direct children
			const tp2Children = await tp2.hasChildren(); // no children

			expect(tp1Children).toEqual(true);
			expect(tp2Children).toEqual(false);
		});

		it('Can get TestPlan children - direct only', async () => {
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [plan2Vals, plan3Vals] })
				);
			const results = await tp1.getChildren(true);
			expect(Array.isArray(results)).toEqual(true);
			expect(results.length).toEqual(2);
			expect(results).toEqual(expect.arrayContaining([tp2, tp3]));
			expect(results).toEqual(expect.not.arrayContaining([tp1, tp4]));
		});

		it('Can get TestPlan children - all nested children, explicit', 
			async () => {
				mockAxios
					.post
					.mockResolvedValueOnce(
						mockRpcResponse({ result: [plan2Vals, plan3Vals] })
					);
				mockAxios
					.post
					.mockResolvedValueOnce(
						mockRpcResponse({ result: [] })
					);
				mockAxios
					.post
					.mockResolvedValueOnce(
						mockRpcResponse({ result: [plan4Vals] })
					);
				mockAxios
					.post
					.mockResolvedValueOnce(
						mockRpcResponse({ result: [] })
					);
				const tp1Children = await tp1.getChildren(false);

				mockAxios
					.post
					.mockResolvedValueOnce(
						mockRpcResponse({ result: [plan4Vals] })
					);
				mockAxios
					.post
					.mockResolvedValueOnce(
						mockRpcResponse({ result: [] })
					);
				const tp3Children = await tp3.getChildren(false);

				expect(Array.isArray(tp1Children)).toEqual(true);
				expect(tp1Children.length).toEqual(3);
				expect(tp1Children)
					.toEqual(expect.arrayContaining([tp2, tp3, tp4]));
				expect(tp1Children)
					.toEqual(expect.not.arrayContaining([tp1]));

				expect(Array.isArray(tp3Children)).toEqual(true);
				expect(tp3Children.length).toEqual(1);
				expect(tp3Children)
					.toEqual(expect.arrayContaining([tp4]));
				expect(tp3Children)
					.toEqual(expect.not.arrayContaining([tp1, tp2, tp3]));
			});
	});
});