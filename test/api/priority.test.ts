import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import KiwiConnector from '../../src/core/kiwiConnector';
import { kiwiTestServerInfo } from '../testServerDetails';

describe('Kiwi RPC API - Priority', () => {
	before(async () => {
		KiwiConnector.init(kiwiTestServerInfo);
		await KiwiConnector.login(
			kiwiTestServerInfo.username,
			kiwiTestServerInfo.password,
		);
	});

	it('Priority.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Priority.filter',
			[{ id: 1 }],
		);
		expect(response).to.be.an('array');
		const arr = response as Array<Record<string, unknown>>;
		expect(arr.length).to.be.equal(1);
		const item1 = arr[0];
		expect(item1).to.be.an('object').that.has.all.keys(
			'id',
			'value',
			'is_active',
		);

		expect(item1.id).to.be.a('number').that.is.equal(1);
		expect(item1.value).to.be.a('string');
		expect(item1.is_active).to.be.a('boolean');
	});
});
