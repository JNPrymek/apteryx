import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - Component', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('Component.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Component.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.greaterThanOrEqual(1);
		const item1 = arr[0];
		expect(item1).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'product',
			'initial_owner',
			'initial_qa_contact',
			'description',
			'cases' // Returned by server, but filtered out for local use
		);

		expect(item1.id).to.be.a('number').that.is.equal(1);
		expect(item1.name).to.be.a('string');
		expect(item1.product).to.be.a('number');
		expect(item1.initial_owner).to.be.a('number');
		expect(item1.initial_qa_contact).to.be.a('number');
		expect(item1.description).to.be.a('string');

		expect(
			(item1.cases === null) ||
			(typeof item1.cases === 'number')
		).to.be.true;
	});
});
