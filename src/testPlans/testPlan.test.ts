import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Product from '../management/product';
import Version from '../management/version';
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

	const tp1 = new TestPlan(plan1Vals);
	const tp2 = new TestPlan(plan2Vals);

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

			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [prodVersionVals]}));
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

			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [prodVals]}));
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

			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [typeVals]}));
			const tp1Type = await tp1.getType();
			expect(tp1Type).toEqual(tpType);
		});

		it('Can get TestPlan parent ID', () => {
			expect(tp1.getParentId()).toBeNull();
			expect(tp2.getParentId()).toEqual(1);
		});

		it('Can get TestPlan Parent', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [plan1Vals] }));
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
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [plan1Vals]}));
			const results = await TestPlan.getById(1);
			expect(results).toEqual(tp1);
		});

		it('Can get TestPlan by single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			expect(TestPlan.getById(1)).rejects.toThrowError('Could not find any TestPlan with ID 1');
		});

		it('Can get TestPlan by Name (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result:[plan1Vals]}));
			const result = await TestPlan.getByName('Example Tests');
			expect(result).toEqual(tp1);
		});

		it('Can get TestPlan by Name (0 matches)', () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			const name = 'Non-used name';
			expect(TestPlan.getByName(name)).rejects.toThrowError(`TestPlan with name "${name}" could not be found.`);
		});
	});
});