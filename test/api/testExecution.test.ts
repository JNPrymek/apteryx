import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';
import { kiwiTestServerInfo } from '../testServerDetails';

describe('Kiwi RPC API - TestExecution', () => {

	before(async () => {
		KiwiConnector.init(kiwiTestServerInfo);
		await KiwiConnector.login(
			kiwiTestServerInfo.username,
			kiwiTestServerInfo.password
		);
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
			'status__name',
			'status__color',
			'status__icon',
			'actual_duration',
			'expected_duration'
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
		expect(item.status__color).to.be.a('string');
		expect(item.status__icon).to.be.a('string');
		expect(item.expected_duration).to.be.a('number');
		expect(
			(item.actual_duration === null) ||
			(typeof item.actual_duration === 'number')
		).to.be.true;
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

	it('TestExecution.get_comments returns expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'TestExecution.get_comments',
			[1]
		);

		expect(result).to.be.an('array');
		const arr = result as Array<Record<string, unknown>>;
		expect(arr.length).to.be.greaterThan(0);
		arr.forEach( item => {
			expect(item).to.be.an('object').that.has.all.keys([
				'id',
				'content_type_id',
				'object_pk',
				'site_id',
				'user_id',
				'user_name',
				'user_email',
				'user_url',
				'comment',
				'submit_date',
				'ip_address',
				'is_public',
				'is_removed',
			]);
			expect(item.id).to.be.a('number');
			expect(item.user_id).to.be.a('number');
			expect(item.site_id).to.be.a('number');
			expect(item.content_type_id).to.be.a('number');
			expect(item.object_pk).to.be.a('string');
			expect(item.user_name).to.be.a('string');
			expect(item.user_email).to.be.a('string');
			expect(item.user_url).to.be.a('string');
			expect(item.comment).to.be.a('string');
			expect(item.submit_date).to.be.a('string');
			expect(item.is_public).to.be.a('boolean');
			expect(item.is_removed).to.be.a('boolean');
		});
	});

	it('TestExecution.add_comment returns expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'TestExecution.add_comment',
			[1, 'comment from API Integration test']
		);
		expect(result).to.be.an('object').that.has.all.keys([
			'id',
			'content_type',
			'object_pk',
			'site',
			'user',
			'user_name',
			'user_email',
			'user_url',
			'comment',
			'submit_date',
			'ip_address',
			'is_public',
			'is_removed'
		]);
	});

	it('TestExecution.remove_comment returns expected type', async () => {
		const comment = await KiwiConnector.sendRPCMethod(
			'TestExecution.add_comment',
			[1, 'comment pending removal from API Integration test']
		) as Record<string, number | string>;
		const result = await KiwiConnector.sendRPCMethod(
			'TestExecution.remove_comment',
			[1, comment.id]
		);
		expect(result).to.be.null;
	});
});
