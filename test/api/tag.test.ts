import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - Tag', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('Tag.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Tag.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.greaterThanOrEqual(1);
		const item1 = arr[0];
		expect(item1).to.be.an('object').that.has.all.keys(
			'id',
			'name',

			// Server values, discarded client-side
			'case',
			'plan',
			'run',
			'bugs'
		);

		expect(item1.id).to.be.a('number').that.is.equal(1);
		expect(item1.name).to.be.a('string');

		expect(
			(item1.case === null) ||
			(typeof item1.case === 'number')
		).to.be.true;
		expect(
			(item1.plan === null) ||
			(typeof item1.plan === 'number')
		).to.be.true;
		expect(
			(item1.run === null) ||
			(typeof item1.run === 'number')
		).to.be.true;
		expect(
			(item1.bugs === null) ||
			(typeof item1.bugs === 'number')
		).to.be.true;
	});
});
