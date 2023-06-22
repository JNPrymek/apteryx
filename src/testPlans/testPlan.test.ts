import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import { mockTestCase, mockTestPlan } from '../../test/mockKiwiValues';
import Product from '../management/product';
import Version from '../management/version';
import TestCase from '../testCases/testCase';
import PlanType from './planType';

import TestPlan from './testPlan';
import { TestPlanWriteValues } from './testPlan.type';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import { mockTestPlanUpdateResponse } from '../../test/mockValues/testPlans/mockTestPlanValues';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Plan', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const plan1Vals = mockTestPlan();
	const plan2Vals = mockTestPlan({
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
		author: 2,
		author__username: 'bob',
		type: 4,
		type__name: 'Regression',
		parent: 1
	});
	const plan3Vals = mockTestPlan({
		...plan2Vals,
		id: 3,
		name: 'Plan 3'
	});
	const plan4Vals = mockTestPlan({
		id: 4,
		name: 'Plan 4',
		text: 'Nexted Test Plans',
		extra_link: null,
		parent: 3
	});

	

	it('Can instantiate a TestPlan', () => {
		const tp1 = new TestPlan(plan1Vals);
		expect(tp1['serialized']).toEqual(plan1Vals);
		const tp2 = new TestPlan(plan2Vals);
		expect(tp2['serialized']).toEqual(plan2Vals);
	});

	describe('Can access local properties of TestPlan', () => {
		const plan1 = new TestPlan(plan1Vals);
		const plan2 = new TestPlan(plan2Vals);
	
		it('Can get TestPlan ID', () => {
			expect(plan1.getId()).toEqual(1);
			expect(plan2.getId()).toEqual(2);
		});

		it('Can get TestPlan Name', () => {
			expect(plan1.getName()).toEqual('Example Test Plan');
			expect(plan2.getName()).toEqual('More Example Tests');
		});

		it('Can get TestPlan Text', () => {
			/* eslint-disable-next-line max-len */
			expect(plan1.getText()).toEqual('An example test plan used for unit tests.\nThis is the description.');
			expect(plan2.getText()).toEqual('Another Example Test Plan');
		});

		it('Can get Test Plan Creation Date', () => {
			const date1 = new Date('2022-12-02T20:11:13.015Z');
			const date2 = new Date('2022-12-02T20:11:13.015Z');

			expect(plan1.getCreateDate()).toEqual(date1);
			expect(plan2.getCreateDate()).toEqual(date2);
		});

		it('Can get TestPlan is Active', () => {
			expect(plan1.isActive()).toEqual(true);
			expect(plan2.isActive()).toEqual(false);
		});

		it('Can get TestPlan is Disabled', () => {
			expect(plan1.isDisabled()).toEqual(false);
			expect(plan2.isDisabled()).toEqual(true);
		});

		it('Can get TestPlan Extra Link', () => {
			expect(plan1.getExtraLink()).toEqual(null);
			expect(plan2.getExtraLink()).toEqual('This is an extra link');
		});

		it('Can get TestPlan Product Version ID', () => {
			expect(plan1.getProductVersionId()).toEqual(1);
			expect(plan2.getProductVersionId()).toEqual(2);
		});

		it('Can get TestPlan Product Version Value', () => {
			expect(plan1.getProductVersionValue()).toEqual('unspecified');
			expect(plan2.getProductVersionValue()).toEqual('v1.3.2');
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
			const tp1ProdVersion = await plan1.getProductVersion();
			expect(tp1ProdVersion).toEqual(prodVersion);
		});

		it('Can get TestPlan Product ID', () => {
			expect(plan1.getProductId()).toEqual(1);
			expect(plan2.getProductId()).toEqual(2);
		});

		it('Can get TestPlan Product Name', () => {
			expect(plan1.getProductName()).toEqual('Example.com Website');
			expect(plan2.getProductName()).toEqual('ExampleApp');
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
			const tp1Product = await plan1.getProduct();
			expect(tp1Product).toEqual(product);
		});

		it('Can get TestPlan Type ID', () => {
			expect(plan1.getTypeId()).toEqual(1);
			expect(plan2.getTypeId()).toEqual(4);
		});

		it('Can get TestPlan Type Name', () => {
			expect(plan1.getTypeName()).toEqual('Unit');
			expect(plan2.getTypeName()).toEqual('Regression');
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
			const tp1Type = await plan1.getType();
			expect(tp1Type).toEqual(tpType);
		});

		it('Can get TestPlan parent ID', () => {
			expect(plan1.getParentId()).toBeNull();
			expect(plan2.getParentId()).toEqual(1);
		});

		it('Can get TestPlan Parent', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [plan1Vals] }));
			const tp2Parent = await plan2.getParent();
			expect(tp2Parent).toEqual(plan1);
		});

		it('Can get TestPlan Parent - null parent', async () => {
			const tp1Parent = await plan1.getParent();
			expect(tp1Parent).toBeNull();
		});

	});

	describe('Updating TestPlan values', () => {
		
		it('Can call the update method with specified paramters', async () => {
			const update1Vals: Partial<TestPlanWriteValues> = {
				text: 'new text value'
			};
			const update2Vals: Partial<TestPlanWriteValues> = {
				is_active: false,
				type: 3
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					text: 'new text value'
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						text: 'new text value'
					})
				]
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					id: 2,
					is_active: false,
					type: 3
				}),
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						id: 2,
						is_active: false,
						type: 3,
						type__name: 'Function'
					})
				]
			}));

			const plan1 = new TestPlan(mockTestPlan());
			const plan2 = new TestPlan(mockTestPlan({ id: 2 }));

			/* eslint-disable-next-line max-len */
			expect(plan1.getText()).toEqual('An example test plan used for unit tests.\nThis is the description.');
			expect(plan2.isActive()).toEqual(true);
			expect(plan2.getTypeId()).toEqual(1);
			expect(plan2.getTypeName()).toEqual('Unit');

			await plan1.serverUpdate(update1Vals);
			await plan2.serverUpdate(update2Vals);

			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, update1Vals]
			);
			verifyRpcCall(
				mockAxios,
				2,
				'TestPlan.update',
				[2, update2Vals]
			);

			expect(plan1.getText()).toEqual('new text value');
			expect(plan2.isActive()).toEqual(false);
			expect(plan2.getTypeId()).toEqual(3);
			expect(plan2.getTypeName()).toEqual('Function');
		});

		it('Can update the TestPlan Name', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				name: 'Original Name'
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				name: 'Updated Name'
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					name: 'Updated Name'
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						name: 'Updated Name'
					})
				]
			}));

			expect(tp1.getName()).toEqual('Original Name');

			await tp1.setName('Updated Name');
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getName()).toEqual('Updated Name');
		});
	});

	describe('Basic Server Functions', () => {
		const plan1 = new TestPlan(plan1Vals);
		
		// get by name - 0, 1, multiple matches
		it('Can get TestPlan by a single ID (one match)', async () => {
			mockAxios
				.post
				.mockResolvedValue(mockRpcResponse({ result: [plan1Vals] }));
			const results = await TestPlan.getById(1);
			expect(results).toEqual(plan1);
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
			expect(result).toEqual(plan1);
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
		const plan1 = new TestPlan(plan1Vals);
		const plan3 = new TestPlan(plan3Vals);
		
		const case1Vals = mockTestCase();
		const case2Vals = mockTestCase({
			id: 2,
			summary: 'Second Test Case'
		});
		const case3Vals = mockTestCase({
			id: 3,
			summary: 'Third Test Case'
		});
		const case4Vals = mockTestCase({
			id: 4,
			summary: 'Fourth Test Case'
		});
		
		const sortKeysRawResponse = {
			'1': 30,
			'2': 20,
			'3': 10,
			'4': 40
		};

		const tcListIdSort = [
			new TestCase(case1Vals),
			new TestCase(case2Vals),
			new TestCase(case3Vals),
			new TestCase(case4Vals)
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
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [
					case1Vals,
					case2Vals,
					case3Vals,
					case4Vals
				] 
			}));
			const planCases = await plan1.getTestCases();
			expect(planCases).toEqual(tcListKeySort);
		});

		it('Can get list of TestCases - TC ID order', async ()=> {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [
					case1Vals,
					case2Vals,
					case3Vals,
					case4Vals
				] 
			}));
			const planCases = await plan1.getTestCases('TESTCASE_ID');
			expect(planCases).toEqual(tcListIdSort);
		});

		it('Can get list of TestCases - SortKey order', async ()=> {
			mockAxios
				.post
				.mockResolvedValueOnce(
					mockRpcResponse({ result: sortKeysRawResponse }));
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [
					case1Vals,
					case2Vals,
					case3Vals,
					case4Vals
				] 
			}));
			const planCases = await plan1.getTestCases('SORTKEY');
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
				expect(tc1Plans)
					.toEqual(expect.arrayContaining([plan1, plan3]));
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
				expect(tc1Plans)
					.toEqual(expect.arrayContaining([plan1, plan3]));
				expect(tc1Plans.length).toEqual(2);
			});
	});

	describe('TestPlan - TestPlan Relations', () => {
		const plan1 = new TestPlan(plan1Vals);
		const plan2 = new TestPlan(plan2Vals);
		const plan3 = new TestPlan(plan3Vals);
		const plan4 = new TestPlan(plan4Vals);
		
		it('TestPlan with children can return list of direct child TestPlans', 
			async () => {
				mockAxios
					.post
					.mockResolvedValue(
						mockRpcResponse({ result: [plan2Vals, plan3Vals] })
					);
				const results = await plan1.getDirectChildren();
				expect(Array.isArray(results)).toEqual(true);
				expect(results.length).toEqual(2);
				expect(results).toEqual(expect.arrayContaining([plan2, plan3]));
				expect(results).toEqual(expect.not.arrayContaining([plan1]));
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
			
			const tp1Children = await plan1.hasChildren(); // 2 direct children
			const tp2Children = await plan2.hasChildren(); // no children

			expect(tp1Children).toEqual(true);
			expect(tp2Children).toEqual(false);
		});

		it('Can get TestPlan children - direct only', async () => {
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [plan2Vals, plan3Vals] })
				);
			const results = await plan1.getChildren(true);
			expect(Array.isArray(results)).toEqual(true);
			expect(results.length).toEqual(2);
			expect(results).toEqual(expect.arrayContaining([plan2, plan3]));
			expect(results).toEqual(expect.not.arrayContaining([plan1, plan4]));
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
				const tp1Children = await plan1.getChildren(false);

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
				const tp3Children = await plan3.getChildren(false);

				expect(Array.isArray(tp1Children)).toEqual(true);
				expect(tp1Children.length).toEqual(3);
				expect(tp1Children)
					.toEqual(expect.arrayContaining([plan2, plan3, plan4]));
				expect(tp1Children)
					.toEqual(expect.not.arrayContaining([plan1]));

				expect(Array.isArray(tp3Children)).toEqual(true);
				expect(tp3Children.length).toEqual(1);
				expect(tp3Children)
					.toEqual(expect.arrayContaining([plan4]));
				expect(tp3Children)
					.toEqual(expect.not.arrayContaining([plan1, plan2, plan3]));
			});
	});
});
