import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - TestExecution', () => {

	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('TestExecution.filter returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestExecution.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const item = arr[0];
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'assignee',
			'assignee__username',
			'tested_by',
			'tested_by__username',
			'case_text_version',
			'start_date',
			'stop_date',
			'sortkey',
			'run',
			'case',
			'case__summary',
			'build',
			'build__name',
			'status',
			'status__name'
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(
			(item.assignee === null) ||
			(typeof item.assignee === 'number')
		).to.be.true;
		expect(
			(item.assignee__username === null) ||
			(typeof item.assignee__username === 'string')
		).to.be.true;
		expect(
			(item.tested_by === null) ||
			(typeof item.tested_by === 'number')
		).to.be.true;
		expect(
			(item.tested_by__username === null) ||
			(typeof item.tested_by__username === 'string')
		).to.be.true;
		expect(item.case_text_version).to.be.a('number');
		expect(
			(item.start_date === null) ||
			(typeof item.start_date === 'string')
		).to.be.true;
		expect(
			(item.stop_date === null) ||
			(typeof item.stop_date === 'string')
		).to.be.true;
		expect(item.sortkey).to.be.a('number');
		expect(item.run).to.be.a('number');
		expect(item.case).to.be.a('number');
		expect(item.case__summary).to.be.a('string');
		expect(item.build).to.be.a('number');
		expect(item.build__name).to.be.a('string');
		expect(item.status).to.be.a('number');
		expect(item.status__name).to.be.a('string');
	});

	it('TestExecution.update returns expected type', async () => {
		const filterResponse = await KiwiConnector.sendRPCMethod(
			'TestExecution.filter',
			[{ id: 1 }]
		);
		const ex1 = (filterResponse as Array<Record<string, unknown>>)[0];
		
		const result = await KiwiConnector.sendRPCMethod(
			'TestExecution.update',
			[
				1,
				{ status: ex1.status }
			]
		);

		expect(result).to.be.an('object');
		const item = (result as Record<string, unknown>);
		
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'assignee',
			'assignee__username',
			'tested_by',
			'tested_by__username',
			'case_text_version',
			'start_date',
			'stop_date',
			'sortkey',
			'run',
			'case',
			'case__summary',
			'build',
			'build__name',
			'status',
			'status__name'
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(
			(item.assignee === null) ||
			(typeof item.assignee === 'number')
		).to.be.true;
		expect(
			(item.assignee__username === null) ||
			(typeof item.assignee__username === 'string')
		).to.be.true;
		expect(
			(item.tested_by === null) ||
			(typeof item.tested_by === 'number')
		).to.be.true;
		expect(
			(item.tested_by__username === null) ||
			(typeof item.tested_by__username === 'string')
		).to.be.true;
		expect(item.case_text_version).to.be.a('number');
		expect(
			(item.start_date === null) ||
			(typeof item.start_date === 'string')
		).to.be.true;
		expect(
			(item.stop_date === null) ||
			(typeof item.stop_date === 'string')
		).to.be.true;
		expect(item.sortkey).to.be.a('number');
		expect(item.run).to.be.a('number');
		expect(item.case).to.be.a('number');
		expect(item.case__summary).to.be.a('string');
		expect(item.build).to.be.a('number');
		expect(item.build__name).to.be.a('string');
		expect(item.status).to.be.a('number');
		expect(item.status__name).to.be.a('string');
	});
});
