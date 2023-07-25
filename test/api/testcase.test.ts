import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';


const dateRegex = /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(.\d{3})?/;

describe('Kiwi RPC API - TestCase', () => {

	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('TestCase.filter returns expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'TestCase.filter',
			[{ id: 1 }]
		);
		expect(result).to.be.an('array');
		const arr = (result as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const tc1 = arr[0];
		expect(tc1).to.be.an('object').that.has.all.keys(
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
			'case_status__name',
			'category',
			'category__name',
			'priority',
			'priority__value',
			'author',
			'author__username',
			'default_tester',
			'default_tester__username',
			'reviewer',
			'reviewer__username',
			'setup_duration',
			'testing_duration',
			'expected_duration',
		);

		expect(tc1.id).to.be.a('number').that.equals(1);
		expect(tc1.create_date).to.be.a('string').that.matches(dateRegex);
		expect(tc1.is_automated).to.be.a('boolean');
		expect(tc1.script).to.be.a('string');
		expect(tc1.arguments).to.be.a('string');
		expect(
			(tc1.extra_link === null) ||
			(typeof tc1.extra_link === 'string')
		).to.be.true;
		expect(tc1.summary).to.be.a('string');
		expect(
			(tc1.requirement === null) ||
			(typeof tc1.requirement === 'string')
		).to.be.true;
		expect(tc1.notes).to.be.a('string');
		expect(tc1.text).to.be.a('string');
		expect(tc1.case_status).to.be.a('number');
		expect(tc1.case_status__name).to.be.a('string');
		expect(tc1.category).to.be.a('number');
		expect(tc1.category__name).to.be.a('string');
		expect(tc1.priority).to.be.a('number');
		expect(tc1.priority__value).to.be.a('string');
		expect(tc1.author).to.be.a('number');
		expect(tc1.author__username).to.be.a('string');
		expect(
			(tc1.default_tester === null) ||
			(typeof tc1.default_tester === 'number')
		).to.be.true;
		expect(
			(tc1.default_tester__username === null) ||
			(typeof tc1.default_tester__username === 'string')
		).to.be.true;
		expect(
			(tc1.reviewer === null) ||
			(typeof tc1.reviewer === 'number')
		).to.be.true;
		expect(
			(tc1.reviewer__username === null) ||
			(typeof tc1.reviewer__username === 'string')
		).to.be.true;
		expect(
			(tc1.setup_duration === null) ||
			(typeof tc1.setup_duration === 'number')
		).to.be.true;
		expect(
			(tc1.testing_duration === null) ||
			(typeof tc1.testing_duration === 'number')
		).to.be.true;
		expect(tc1.expected_duration).to.be.a('number');
	});
});
