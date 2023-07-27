import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - Classification', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('Classification.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Classification.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const item1 = arr[0];
		expect(item1).to.be.an('object').that.has.all.keys(
			'id',
			'name'
		);

		expect(item1.id).to.be.a('number').that.is.equal(1);
		expect(item1.name).to.be.a('string');
	});
});
