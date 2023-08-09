import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';
import { TestRunCaseEntry } from '../../src/testRuns/testRun.type';
import {
	TestExecutionCreateResponse
} from '../../src/testRuns/testExecution.type';

describe('Kiwi RPC API - TestRun', () => {

	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: true,
			port: 443
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('TestRun.filter returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestRun.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const item = arr[0];
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'plan__product_version',
			'plan__product_version__value',
			'start_date',
			'stop_date',
			'planned_start',
			'planned_stop',
			'summary',
			'notes',
			'plan',
			'plan__product',
			'plan__name',
			'build',
			'build__name',
			'manager',
			'manager__username',
			'default_tester',
			'default_tester__username'
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(item.plan__product_version).to.be.a('number');
		expect(item.plan__product_version__value).to.be.a('string');
		
		expect(
			(item.start_date === null) ||
			(typeof item.start_date === 'string')
		).to.be.true;
		expect(
			(item.stop_date === null) ||
			(typeof item.stop_date === 'string')
		).to.be.true;
		expect(
			(item.planned_start === null) ||
			(typeof item.planned_start === 'string')
		).to.be.true;
		expect(
			(item.planned_stop === null) ||
			(typeof item.planned_stop === 'string')
		).to.be.true;
		expect(item.summary).to.be.a('string');
		expect(item.notes).to.be.a('string');
		expect(item.plan).to.be.a('number');
		expect(item.plan__product).to.be.a('number');
		expect(item.plan__name).to.be.a('string');
		expect(item.build).to.be.a('number');
		expect(item.build__name).to.be.a('string');
		expect(
			(item.manager === null) ||
			(typeof item.manager === 'number')
		).to.be.true;
		expect(
			(item.manager__username === null) ||
			(typeof item.manager__username === 'string')
		).to.be.true;
		expect(
			(item.default_tester === null) ||
			(typeof item.default_tester === 'number')
		).to.be.true;
		expect(
			(item.default_tester__username === null) ||
			(typeof item.default_tester__username === 'string')
		).to.be.true;
	});

	it('TestRun.update returns expected type', async () => {
		const runResponse = await KiwiConnector.sendRPCMethod(
			'TestRun.filter',
			[{ id: 1 }]
		);
		const run1 = (runResponse as Array<Record<string, unknown>>)[0];

		const response = await KiwiConnector.sendRPCMethod(
			'TestRun.update',
			[
				1,
				{ summary: run1.summary }
			]
		);
		expect(response).to.be.an('object');
		const item = (response as Record<string, unknown>);
		
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'start_date',
			'stop_date',
			'planned_start',
			'planned_stop',
			'summary',
			'notes',
			'plan',
			'build',
			'manager',
			'default_tester',
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(
			(item.start_date === null) ||
			(typeof item.start_date === 'string')
		).to.be.true;
		expect(
			(item.stop_date === null) ||
			(typeof item.stop_date === 'string')
		).to.be.true;
		expect(
			(item.planned_start === null) ||
			(typeof item.planned_start === 'string')
		).to.be.true;
		expect(
			(item.planned_stop === null) ||
			(typeof item.planned_stop === 'string')
		).to.be.true;
		expect(item.summary).to.be.a('string');
		expect(item.notes).to.be.a('string');
		expect(item.plan).to.be.a('number');
		expect(item.build).to.be.a('number');
		expect(
			(item.manager === null) ||
			(typeof item.manager === 'number')
		).to.be.true;
		expect(
			(item.default_tester === null) ||
			(typeof item.default_tester === 'number')
		).to.be.true;
	});

	it('TestRun.create returns expected type', async () => {
		const summary = 'Integration Test Example Test Ru';
		const plan = 1;
		const build = 1;
		const manager = 2;

		const response = await KiwiConnector.sendRPCMethod(
			'TestRun.create',
			[{
				summary,
				plan,
				build,
				manager
			}]
		);
		expect(response).to.be.an('object');
		const item = (response as Record<string, unknown>);
		
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'start_date',
			'stop_date',
			'planned_start',
			'planned_stop',
			'summary',
			'notes',
			'plan',
			'build',
			'manager',
			'default_tester',
		);

		expect(item.id).to.be.a('number').that.is.greaterThanOrEqual(1);
		expect(
			(item.start_date === null) ||
			(typeof item.start_date === 'string')
		).to.be.true;
		expect(
			(item.stop_date === null) ||
			(typeof item.stop_date === 'string')
		).to.be.true;
		expect(
			(item.planned_start === null) ||
			(typeof item.planned_start === 'string')
		).to.be.true;
		expect(
			(item.planned_stop === null) ||
			(typeof item.planned_stop === 'string')
		).to.be.true;
		expect(item.summary).to.be.a('string').that.equals(summary);
		expect(item.notes).to.be.a('string');
		expect(item.plan).to.be.a('number').that.equals(plan);
		expect(item.build).to.be.a('number').that.equals(plan);
		expect(item.manager).to.be.a('number').that.equals(manager);
		expect(
			(item.default_tester === null) ||
			(typeof item.default_tester === 'number')
		).to.be.true;
	});
	
	it('TestRun.get_cases returns expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'TestRun.get_cases',
			[ 1 ] // Test Run ID
		);
		expect(result).to.be.an('array');
		const arr = result as Array<TestRunCaseEntry>;
		expect(arr.length).to.be.greaterThan(0);
		const item = arr[0];
		expect(item).to.have.all.keys([
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
			'execution_id',
			'status'
		]);
		
		expect(item.id).to.be.a('number');
		expect(item.create_date).to.be.a('string');
		expect(item.is_automated).to.be.a('boolean');
		expect(item.script).to.be.a('string');
		expect(item.arguments).to.be.a('string');
		expect(
			(item.extra_link === null) ||
			(typeof item.extra_link === 'string')
		).to.be.true;
		expect(item.summary).to.be.a('string');
		expect(
			(item.requirement === null) ||
			(typeof item.requirement === 'string')
		).to.be.true;
		expect(item.notes).to.be.a('string');
		expect(item.text).to.be.a('string');
		expect(item.case_status).to.be.a('number');
		expect(item.category).to.be.a('number');
		expect(item.priority).to.be.a('number');
		expect(item.author).to.be.a('number');
		expect(
			(item.default_tester === null) ||
			(typeof item.default_tester === 'number')
		).to.be.true;
		expect(
			(item.reviewer === null) ||
			(typeof item.reviewer === 'number')
		).to.be.true;
		expect(item.execution_id).to.be.a('number');
		expect(item.status).to.be.a('string');
	});

	it('TestRun.add_case returns expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'TestRun.add_case',
			[
				1, // TestRun ID
				2 // TestCase ID
			]
		);
		expect(result).to.be.an('object').that.has.all.keys([
			'id',
			'assignee',
			'tested_by',
			'case_text_version',
			'start_date',
			'stop_date',
			'sortkey',
			'run',
			'case',
			'build',
			'status'
		]);
		const item = result as TestExecutionCreateResponse;

		expect(item.id).is.a('number');
		expect(
			(item.assignee === null) ||
			(typeof item.assignee === 'number')
		).to.be.true;
		expect(
			(item.tested_by === null) ||
			(typeof item.tested_by === 'number')
		).to.be.true;
		expect(item.case_text_version).is.a('number');
		expect(
			(item.start_date === null) ||
			(typeof item.start_date === 'string')
		).to.be.true;
		expect(
			(item.stop_date === null) ||
			(typeof item.stop_date === 'string')
		).to.be.true;
		expect(item.sortkey).is.a('number');
		expect(item.build).is.a('number');
		expect(item.status).is.a('number');

		expect(item.run).is.a('number').that.equals(1);
		expect(item.case).is.a('number').that.equals(2);
	});
});
