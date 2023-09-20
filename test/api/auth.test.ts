import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';
import { kiwiTestServerInfo } from '../testServerDetails';

describe('Kiwi RPC API - Auth', () => {

	before(() => {
		KiwiConnector.init(kiwiTestServerInfo);
	});

	it('Auth.login returns expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'Auth.login',
			['debug', 'debug']
		);
		expect(result).to.be.a('string');
		expect((result as string).length).to.be.greaterThan(0);
	});

	it('Auth.logout returns expected type', async () => {
		await KiwiConnector.login('debug', 'debug');
		const result = await KiwiConnector.sendRPCMethod(
			'Auth.logout',
			[]
		);
		expect(result).to.be.null;
	});
});
