import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import KiwiConnector from '../../src/core/kiwiConnector';
import { kiwiTestServerInfo } from '../testServerDetails';

const dateRegex = /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(.\d{3})?/;

describe('Kiwi RPC API - TestPlan', () => {
	before(async () => {
		KiwiConnector.init(kiwiTestServerInfo);
		await KiwiConnector.login(
			kiwiTestServerInfo.username,
			kiwiTestServerInfo.password,
		);
	});

	it('TestPlan.filter returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.filter',
			[{ id: 1 }],
		);
		expect(response).to.be.an('array');
		const arr = response as Array<Record<string, unknown>>;
		expect(arr.length).to.be.equal(1);
		const item = arr[0];
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'text',
			'create_date',
			'is_active',
			'extra_link',
			'product_version',
			'product_version__value',
			'product',
			'product__name',
			'author',
			'author__username',
			'type',
			'type__name',
			'parent',
			'children__count',
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(item.name).to.be.a('string');
		expect(item.text).to.be.a('string');
		expect(item.create_date).to.be.a('string').that.matches(dateRegex);
		expect(item.is_active).to.be.a('boolean');
		expect(
			(item.extra_link === null)
				|| (typeof item.extra_link === 'string'),
		).to.be.true;
		expect(item.product_version).to.be.a('number');
		expect(item.product_version__value).to.be.a('string');
		expect(item.product).to.be.a('number');
		expect(item.product__name).to.be.a('string');
		expect(item.author).to.be.a('number');
		expect(item.author__username).to.be.a('string');
		expect(item.type).to.be.a('number');
		expect(item.type__name).to.be.a('string');
		expect(
			(item.parent === null)
				|| (typeof item.parent === 'number'),
		).to.be.true;
		expect(item.children__count).to.be.a('number');
	});

	it('TestPlan.create returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.create',
			[{
				product: 1,
				product_version: 1,
				type: 1,
				name: 'API integration test - example TestPlan',
			}],
		);
		expect(response).to.be.an('object');
		const item = response as Record<string, undefined>;
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'text',
			'create_date',
			'is_active',
			'extra_link',
			'product_version',
			'product',
			'author',
			'type',
			'parent',
		);

		expect(item.id).to.be.a('number').that.is.greaterThanOrEqual(1);
		expect(item.name).to.be.a('string');
		expect(item.text).to.be.a('string');
		expect(item.create_date).to.be.a('string').that.matches(dateRegex);
		expect(item.is_active).to.be.a('boolean');
		expect(
			(item.extra_link === null)
				|| (typeof item.extra_link === 'string'),
		).to.be.true;
		expect(item.product_version).to.be.a('number');
		expect(item.product).to.be.a('number');
		expect(item.author).to.be.a('number');
		expect(item.type).to.be.a('number');
		expect(
			(item.parent === null)
				|| (typeof item.parent === 'number'),
		).to.be.true;
	});

	it('TestPlan.update returns expected type', async () => {
		const orig = await KiwiConnector.sendRPCMethod(
			'TestPlan.filter',
			[{ id: 1 }],
		);
		const tp1 = orig as Record<string, unknown>;
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.update',
			[1, { name: tp1.name }],
		);
		expect(response).to.be.an('object');
		const item = response as Record<string, unknown>;

		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'text',
			'create_date',
			'is_active',
			'extra_link',
			'product_version',
			'product',
			'author',
			'type',
			'parent',
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(item.name).to.be.a('string');
		expect(item.text).to.be.a('string');
		expect(item.create_date).to.be.a('string').that.matches(dateRegex);
		expect(item.is_active).to.be.a('boolean');
		expect(
			(item.extra_link === null)
				|| (typeof item.extra_link === 'string'),
		).to.be.true;
		expect(item.product_version).to.be.a('number');
		expect(item.product).to.be.a('number');
		expect(item.author).to.be.a('number');
		expect(item.type).to.be.a('number');
		expect(
			(item.parent === null)
				|| (typeof item.parent === 'number'),
		).to.be.true;
	});

	it('TestPlan.add_case returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.add_case',
			// plan 1, case 2
			[1, 2],
		);
		expect(response).to.be.an('object');
		const item = response as Record<string, unknown>;

		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'create_date',
			'is_automated',
			'script',
			'arguments',
			'extra_link',
			'summary',
			'requirement',
			'notes',
			'text',
			'case_status',
			'category',
			'priority',
			'author',
			'default_tester',
			'reviewer',
			'setup_duration',
			'testing_duration',
			'sortkey',
		);

		expect(item.id).to.be.a('number').that.equals(2);
		expect(item.create_date).to.be.a('string').that.matches(dateRegex);
		expect(item.is_automated).to.be.a('boolean');
		expect(item.script).to.be.a('string');
		expect(item.arguments).to.be.a('string');
		expect(
			(item.extra_link === null)
				|| (typeof item.extra_link === 'string'),
		).to.be.true;
		expect(item.summary).to.be.a('string');
		expect(
			(item.requirement === null)
				|| (typeof item.requirement === 'string'),
		).to.be.true;
		expect(item.notes).to.be.a('string');
		expect(item.text).to.be.a('string');
		expect(item.case_status).to.be.a('number');
		expect(item.category).to.be.a('number');
		expect(item.priority).to.be.a('number');
		expect(item.author).to.be.a('number');
		expect(
			(item.default_tester === null)
				|| (typeof item.default_tester === 'number'),
		).to.be.true;
		expect(
			(item.setup_duration === null)
				|| (typeof item.setup_duration === 'number'),
		).to.be.true;
		expect(
			(item.testing_duration === null)
				|| (typeof item.testing_duration === 'number'),
		).to.be.true;
		expect(item.sortkey).to.be.a('number').that.is.greaterThanOrEqual(0);
	});

	it('TestPlan.remove_case returns expected type', async () => {
		const caseId = 4;
		const planId = 2;
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.remove_case',
			[planId, caseId],
		);
		expect(response).to.be.null;
	});

	it('TestPlan.update_case_order returns expected type', async () => {
		const caseId = 4;
		const planId = 2;
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.update_case_order',
			[planId, caseId, 50],
		);
		expect(response).to.be.null;
	});

	it('TestPlan.add_tag returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.add_tag',
			[1, 'Tag1'],
		);
		expect(response).to.be.null;
	});

	it('TestPlan.remove_tag returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestPlan.remove_tag',
			[1, 'Tag1'],
		);
		expect(response).to.be.null;
	});
});
