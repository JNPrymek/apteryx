import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import { 
	mockProduct,
	mockTestCase,
	mockTestPlan,
	mockVersion,
	mockTestPlanType,
	mockTestPlanUpdateResponse
} from '../../test/mockKiwiValues';
import Product from '../management/product';
import Version from '../management/version';
import TestCase from '../testCases/testCase';
import PlanType from './planType';

import TestPlan from './testPlan';
import {
	TestPlanCreateResponse,
	TestPlanCreateValues,
	TestPlanWriteValues
} from './testPlan.type';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import TimeUtils from '../utils/timeUtils';
import {
	mockTestPlanAddCaseResponse
} from '../../test/mockValues/testCases/mockTestCaseValues';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Test Plan', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});

	const plan1Vals = mockTestPlan({
		children__count: 2
	});
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
		name: 'Plan 3',
		parent: 1,
		children__count: 1
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
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan(updateVal)
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

		it('Can remove the TestPlan Text', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				text: 'Original Text'
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				text: 'Updated Text'
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					text: 'Updated Text'
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						text: 'Updated Text'
					})
				]
			}));

			expect(tp1.getText()).toEqual('Original Text');

			await tp1.setText('Updated Text');
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getText()).toEqual('Updated Text');
		});

		it('Can update the TestPlan Text', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				text: 'Original Text'
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				text: ''
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					text: ''
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						text: ''
					})
				]
			}));

			expect(tp1.getText()).toEqual('Original Text');

			await tp1.setText();
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getText()).toEqual('');
		});

		it('Can update the TestPlan Creation Date using strings', async () => {
			const origDate = '2022-12-08T23:42:11.042';
			const newDate = '2023-03-07T23:42:11.042';

			const tp1 = new TestPlan(mockTestPlan({
				create_date: origDate
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				create_date: newDate
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					create_date: newDate
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						create_date: newDate
					})
				]
			}));

			expect(tp1.getCreateDate())
				.toEqual(TimeUtils.serverStringToDate(origDate));

			await tp1.setCreateDate(newDate);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getCreateDate())
				.toEqual(TimeUtils.serverStringToDate(newDate));
		});

		it('Can update the TestPlan Creation Date using Dates', async () => {
			const origDate = '2022-12-08T23:42:11.042';
			const newDate = '2023-03-07T23:42:11.042';

			const tp1 = new TestPlan(mockTestPlan({
				create_date: origDate
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				create_date: newDate
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					create_date: newDate
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						create_date: newDate
					})
				]
			}));

			expect(tp1.getCreateDate())
				.toEqual(TimeUtils.serverStringToDate(origDate));

			await tp1.setCreateDate(TimeUtils.serverStringToDate(newDate));
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getCreateDate())
				.toEqual(TimeUtils.serverStringToDate(newDate));
		});
		
		it('Can update the TestPlan isActive', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				is_active: true
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				is_active: false
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan(updateVal)
				]
			}));

			expect(tp1.isActive()).toEqual(true);

			await tp1.setIsActive(false);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.isActive()).toEqual(false);
		});
		
		it('Can update the TestPlan to be Active', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				is_active: false
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				is_active: true
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan(updateVal)
				]
			}));

			expect(tp1.isActive()).toEqual(false);

			await tp1.setActive();
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.isActive()).toEqual(true);
		});
		
		it('Can update the TestPlan to be Disabled', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				is_active: true
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				is_active: false
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan(updateVal)
				]
			}));

			expect(tp1.isActive()).toEqual(true);

			await tp1.setDisabled();
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.isActive()).toEqual(false);
		});

		it('Can set the TestPlan Extra Link', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				extra_link: null
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				extra_link: 'new link'
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						extra_link: 'new link'
					})
				]
			}));

			expect(tp1.getExtraLink()).toBeNull();

			await tp1.setExtraLink('new link');
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getExtraLink()).toEqual('new link');
		});

		it('Can remove the TestPlan Extra Link', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				extra_link: 'original link'
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				extra_link: ''
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						extra_link: null
					})
				]
			}));

			expect(tp1.getExtraLink()).toEqual('original link');

			await tp1.setExtraLink();
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getExtraLink()).toBeNull();
		});
		
		it('Can update the TestPlan Product Version by ID', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				product_version: 1,
				product_version__value: 'unspecified'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				product_version: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product_version: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						product_version: 2,
						product_version__value: 'v1.0.0'
					})
				]
			}));
			
			expect(tp1.getProductVersionId()).toEqual(1);
			expect(tp1.getProductVersionValue()).toEqual('unspecified');
			
			await tp1.setProductVersion(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getProductVersionId()).toEqual(2);
			expect(tp1.getProductVersionValue()).toEqual('v1.0.0');
		});
		
		it('Can update the TestPlan Product Version by Version', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				product_version: 1,
				product_version__value: 'unspecified'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				product_version: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product_version: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						product_version: 2,
						product_version__value: 'v1.0.0'
					})
				]
			}));
			
			expect(tp1.getProductVersionId()).toEqual(1);
			expect(tp1.getProductVersionValue()).toEqual('unspecified');
			
			const v2 = new Version(mockVersion({
				id: 2,
				value: 'v1.0.0'
			}));
			await tp1.setProductVersion(v2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getProductVersionId()).toEqual(2);
			expect(tp1.getProductVersionValue()).toEqual('v1.0.0');
		});
		
		it('Can update the TestPlan Product by ID', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				product: 1,
				product__name: 'Example Product'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				product: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						product: 2,
						product__name: 'Second Product'
					})
				]
			}));
			
			expect(tp1.getProductId()).toEqual(1);
			expect(tp1.getProductName()).toEqual('Example Product');
			
			await tp1.setProduct(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getProductId()).toEqual(2);
			expect(tp1.getProductName()).toEqual('Second Product');
		});
		
		it('Can update the TestPlan Product by Product', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				product: 1,
				product__name: 'Example Product'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				product: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						product: 2,
						product__name: 'Second Product'
					})
				]
			}));
			
			expect(tp1.getProductId()).toEqual(1);
			expect(tp1.getProductName()).toEqual('Example Product');
			
			const prod2 = new Product(mockProduct({
				id: 2,
				name: 'Second Product'
			}));
			await tp1.setProduct(prod2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getProductId()).toEqual(2);
			expect(tp1.getProductName()).toEqual('Second Product');
		});
		
		it('Can update the TestPlan Type via ID', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				type: 1,
				type__name: 'Unit'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				type: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						type: 2,
						type__name: 'Integration'
					})
				]
			}));
			
			expect(tp1.getTypeId()).toEqual(1);
			expect(tp1.getTypeName()).toEqual('Unit');
			
			await tp1.setType(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getTypeId()).toEqual(2);
			expect(tp1.getTypeName()).toEqual('Integration');
		});
		
		it('Can update the TestPlan Type via Type', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				type: 1,
				type__name: 'Unit'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				type: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						type: 2,
						type__name: 'Integration'
					})
				]
			}));
			
			expect(tp1.getTypeId()).toEqual(1);
			expect(tp1.getTypeName()).toEqual('Unit');
			
			const type2 = new PlanType(mockTestPlanType({
				id: 2,
				name: 'Integration'
			}));
			await tp1.setType(type2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getTypeId()).toEqual(2);
			expect(tp1.getTypeName()).toEqual('Integration');
		});
		
		it('Can update the TestPlan Type via Type Name', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				type: 1,
				type__name: 'Unit'
			}));
			const updateVal: Partial<TestPlanWriteValues> = {
				type: 2
			};
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ mockTestPlanType({
					id: 2,
					name: 'Integration'
				})]
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse({
					product: 2,
				})
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						type: 2,
						type__name: 'Integration'
					})
				]
			}));
			
			expect(tp1.getTypeId()).toEqual(1);
			expect(tp1.getTypeName()).toEqual('Unit');

			await tp1.setType('Integration');
			verifyRpcCall(
				mockAxios,
				0,
				'PlanType.filter',
				[ { name: 'Integration' }]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.update',
				[1, updateVal]
			);
			
			expect(tp1.getTypeId()).toEqual(2);
			expect(tp1.getTypeName()).toEqual('Integration');
		});

		it('Can set the TestPlan Parent via ID', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				parent: null
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				parent: 2
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						parent: 2
					})
				]
			}));

			expect(tp1.getParentId()).toBeNull();

			await tp1.setParent(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getParentId()).toEqual(2);
		});

		it('Can set the TestPlan Parent via Test Plan', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				parent: null
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				parent: 2
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						parent: 2
					})
				]
			}));

			expect(tp1.getParentId()).toBeNull();

			const tp2 = new TestPlan(mockTestPlan({ id: 2 }));
			await tp1.setParent(tp2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getParentId()).toEqual(2);
		});

		it('Can remove the TestPlan Parent', async () => {
			const tp1 = new TestPlan(mockTestPlan({
				parent: 2
			}));

			const updateVal: Partial<TestPlanWriteValues> = {
				parent: null
			};

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: mockTestPlanUpdateResponse(updateVal)
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [
					mockTestPlan({
						parent: null
					})
				]
			}));

			expect(tp1.getParentId()).toEqual(2);

			await tp1.setParent();
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update',
				[ 1, updateVal ]
			);
			expect(tp1.getParentId()).toBeNull();
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

		it('Can create a TestPlan with minimum values', async () => {
			const createVals: TestPlanCreateValues = {
				product: 1,
				product_version: 1,
				type: 1,
				name: 'A New Test Plan'
			};
			const createResponse: TestPlanCreateResponse = {
				id: 8,
				parent: null,
				name: 'A New Test Plan',
				text: '',
				is_active: true,
				extra_link: null,
				product_version: 1,
				author: 2,
				product: 1,
				type: 1,
				create_date: '2023-08-24T13:08:56.456',
			};
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: createResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ mockTestPlan(createResponse)]
			}));

			const result = await TestPlan.create(createVals);

			expect(result).toBeInstanceOf(TestPlan);
			expect(result.getId()).toEqual(8);
			expect(result.getName()).toEqual('A New Test Plan');
		});

		it('Can create a TestPlan with extra values', async () => {
			const createVals: TestPlanCreateValues = {
				product: 1,
				product_version: 1,
				type: 2,
				name: 'A New Test Plan',
				parent: 3,
				text: 'Some description text'
			};
			const createResponse: TestPlanCreateResponse = {
				id: 8,
				parent: 3,
				name: 'A New Test Plan',
				text: 'Some description text',
				is_active: true,
				extra_link: null,
				product_version: 1,
				author: 2,
				product: 1,
				type: 2,
				create_date: '2023-08-24T13:08:56.456',
			};
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: createResponse
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ mockTestPlan(createResponse)]
			}));

			const result = await TestPlan.create(createVals);

			expect(result).toBeInstanceOf(TestPlan);
			expect(result.getId()).toEqual(8);
			expect(result.getName()).toEqual('A New Test Plan');
			expect(result.getParentId()).toEqual(3);
			expect(result.getTypeId()).toEqual(2);
			expect(result.getText()).toEqual('Some description text');
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

		it('Can add a TestCase to the TestPlan via TestCase', async () => {
			const tc2 = new TestCase(case2Vals);
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: mockTestPlanAddCaseResponse()
			}));

			await plan1.addTestCases(tc2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.add_case',
				[1, 2]
			);
		});

		it('Can add a TestCase to the TestPlan via ID', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: mockTestPlanAddCaseResponse()
			}));

			await plan1.addTestCases(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.add_case',
				[1, 2]
			);
		});

		it('Can add multiple TestCases to the TestPlan', async () => {
			const tc2 = new TestCase(case2Vals);
			const caseList = [
				5,
				3,
				tc2,
				8
			];

			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: mockTestPlanAddCaseResponse()
			}));

			await plan1.addTestCases(caseList);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.add_case',
				[1, 5]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.add_case',
				[1, 3]
			);
			verifyRpcCall(
				mockAxios,
				2,
				'TestPlan.add_case',
				[1, 2]
			);
			verifyRpcCall(
				mockAxios,
				3,
				'TestPlan.add_case',
				[1, 8]
			);
		});

		it('Can remove a TestCase from the TestPlan via TestCase', async () => {
			const tc2 = new TestCase(case2Vals);
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: null
			}));

			await plan1.removeTestCases(tc2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.remove_case',
				[1, 2]
			);
		});

		it('Can remove a TestCase from the TestPlan via ID', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: null
			}));

			await plan1.removeTestCases(2);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.remove_case',
				[1, 2]
			);
		});

		it('Can remove multiple TestCases from the TestPlan', async () => {
			const tc2 = new TestCase(case2Vals);
			const caseList = [
				5,
				3,
				tc2,
				8
			];

			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: mockTestPlanAddCaseResponse()
			}));

			await plan1.removeTestCases(caseList);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.remove_case',
				[1, 5]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.remove_case',
				[1, 3]
			);
			verifyRpcCall(
				mockAxios,
				2,
				'TestPlan.remove_case',
				[1, 2]
			);
			verifyRpcCall(
				mockAxios,
				3,
				'TestPlan.remove_case',
				[1, 8]
			);
		});

		it('Can set a TestCase SortKey via ID', async () => {
			// Setting sortkey returns nothing
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: null
			}));
			await plan1.setSpecificTestCaseSortOrder(25, 30);
			await plan3.setSpecificTestCaseSortOrder(82, 20);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update_case_order',
				[1, 25, 30]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.update_case_order',
				[3, 82, 20]
			);
		});

		it('Can set a TestCase SortKey via TestCase objects', async () => {
			// Setting sortkey returns nothing
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: null
			}));
			const tc25 = new TestCase(mockTestCase({ id: 25 }));
			const tc82 = new TestCase(mockTestCase({ id: 82 }));

			await plan1.setSpecificTestCaseSortOrder(tc25, 30);
			await plan3.setSpecificTestCaseSortOrder(tc82, 20);
			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update_case_order',
				[1, 25, 30]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.update_case_order',
				[3, 82, 20]
			);
		});

		it('Can set a SortKeys for all TestCases in TestPlan', async () => {
			// Setting sortkey returns nothing
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: null
			}));

			const testCaseList = [
				new TestCase(mockTestCase({ id: 25 })),
				new TestCase(mockTestCase({ id: 82 })),
				56,
				new TestCase(mockTestCase({ id: 1 })),
				new TestCase(mockTestCase({ id: 57 })),
				435,
				823,
				new TestCase(mockTestCase({ id: 12 })),
			];

			await plan1.setAllTestCaseSortOrder(testCaseList);

			verifyRpcCall(
				mockAxios,
				0,
				'TestPlan.update_case_order',
				[1, 25, 0]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.update_case_order',
				[1, 82, 10]
			);
			verifyRpcCall(
				mockAxios,
				2,
				'TestPlan.update_case_order',
				[1, 56, 20]
			);
			verifyRpcCall(
				mockAxios,
				3,
				'TestPlan.update_case_order',
				[1, 1, 30]
			);
			verifyRpcCall(
				mockAxios,
				4,
				'TestPlan.update_case_order',
				[1, 57, 40]
			);
			verifyRpcCall(
				mockAxios,
				5,
				'TestPlan.update_case_order',
				[1, 435, 50]
			);
			verifyRpcCall(
				mockAxios,
				6,
				'TestPlan.update_case_order',
				[1, 823, 60]
			);
			verifyRpcCall(
				mockAxios,
				7,
				'TestPlan.update_case_order',
				[1, 12, 70]
			);
		});

		it('Can normalize SortKeys', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: {
					'1': 20,
					'2': 10,
					'3': 0,
					'4': 30,
					'5': 15,
					'6': 15
				}
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: null
			}));

			await plan1.normalizeSortKeys();
			verifyRpcCall(
				mockAxios,
				0,
				'TestCase.sortkeys',
				[{ plan: 1 }]
			);
			verifyRpcCall(
				mockAxios,
				1,
				'TestPlan.update_case_order',
				[ 1, 3, 0 ]
			);
			verifyRpcCall(
				mockAxios,
				2,
				'TestPlan.update_case_order',
				[ 1, 2, 10 ]
			);
			verifyRpcCall(
				mockAxios,
				3,
				'TestPlan.update_case_order',
				[ 1, 5, 20 ]
			);
			verifyRpcCall(
				mockAxios,
				4,
				'TestPlan.update_case_order',
				[ 1, 6, 30 ]
			);
			verifyRpcCall(
				mockAxios,
				5,
				'TestPlan.update_case_order',
				[ 1, 1, 40 ]
			);
			verifyRpcCall(
				mockAxios,
				6,
				'TestPlan.update_case_order',
				[ 1, 4, 50 ]
			);
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
				expect(results).not.toEqual(expect.arrayContaining([plan1]));
			});

		it('Can check if TestPlan has children', async () => {
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
			expect(results).not.toEqual(expect.arrayContaining([plan1, plan4]));
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
					.mockResolvedValue(
						mockRpcResponse({ result: [] })
					);
				const tp3Children = await plan3.getChildren(false);

				expect(Array.isArray(tp1Children)).toEqual(true);
				expect(tp1Children.length).toEqual(3);
				expect(tp1Children)
					.toEqual(expect.arrayContaining([plan2, plan3, plan4]));
				expect(tp1Children)
					.not.toEqual(expect.arrayContaining([plan1]));

				expect(Array.isArray(tp3Children)).toEqual(true);
				expect(tp3Children.length).toEqual(1);
				expect(tp3Children)
					.toEqual(expect.arrayContaining([plan4]));
				expect(tp3Children)
					.not.toEqual(expect.arrayContaining([plan1, plan2, plan3]));
			});
	});
});
