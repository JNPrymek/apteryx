import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - Version', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: true,
			port: 443
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('Version.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Version.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const item1 = arr[0];
		expect(item1).to.be.an('object').that.has.all.keys(
			'id',
			'value',
			'product',
			'product__name'
		);

		expect(item1.id).to.be.a('number').that.is.equal(1);
		expect(item1.value).to.be.a('string');
		expect(item1.product).to.be.a('number');
		expect(item1.product__name).to.be.a('string');
	});
});
