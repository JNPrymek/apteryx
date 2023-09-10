import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - User', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: true,
			port: 443
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('User.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'User.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.equal(1);
		const item1 = arr[0];
		expect(item1).to.be.an('object').that.has.all.keys(
			'id',
			'email',
			'username',
			'first_name',
			'last_name',
			'is_active',
			'is_staff',
			'is_superuser'
		);

		expect(item1.id).to.be.a('number').that.is.equal(1);
		expect(item1.email).to.be.a('string');
		expect(item1.username).to.be.a('string');
		expect(item1.first_name).to.be.a('string');
		expect(item1.last_name).to.be.a('string');
		expect(item1.is_active).to.be.a('boolean');
		expect(item1.is_staff).to.be.a('boolean');
		expect(item1.is_superuser).to.be.a('boolean');
	});
});
