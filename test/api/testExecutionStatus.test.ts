import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - TestExecutionStatus', () => {

	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: true,
			port: 443
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('TestExecutionStatus.filter returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'TestExecutionStatus.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const item = arr[0];
		expect(item).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'weight',
			'icon',
			'color'
		);

		expect(item.id).to.be.a('number').that.equals(1);
		expect(item.name).to.be.a('string');
		expect(item.weight).to.be.a('number');
		expect(item.icon).to.be.a('string');
		expect(item.color).to.be.a('string');
	});
});
