import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - TestCaseStatus', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('TestCaseStatus.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestCaseStatus.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const stat1 = arr[0];
		expect(stat1).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'description',
			'is_confirmed'
		);
		expect(stat1.id).to.be.a('number').that.is.equal(1);
		expect(stat1.name).to.be.a('string');
		expect(stat1.description).to.be.a('string');
		expect(stat1.is_confirmed).to.be.a('boolean');
	});
});
