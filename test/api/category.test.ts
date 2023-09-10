import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - Category', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: false,
			port: 80
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('Category.filter returns expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Category.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const category1 = arr[0];
		expect(category1).to.be.an('object').that.has.all.keys(
			'id',
			'name',
			'product',
			'description'
		);
		
		expect(category1.id).to.be.a('number').that.is.equal(1);
		expect(category1.name).to.be.a('string');
		expect(category1.product).to.be.a('number').that.is.greaterThan(0);
		expect(category1.description).to.be.a('string');
	});
});
