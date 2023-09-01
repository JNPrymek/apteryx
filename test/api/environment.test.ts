import { randomUUID } from 'crypto';
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import KiwiConnector from '../../src/core/kiwiConnector';

describe('Kiwi RPC API - Component', () => {
	before(async () => {
		KiwiConnector.init({
			hostName: 'localhost',
			useSSL: true,
			port: 443
		});
		await KiwiConnector.login('debug', 'debug');
	});

	it('Environment.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Environment.filter',
			[{ id: 1 }]
		);
		expect(response).to.be.an('array');
		const arr = (response as Array<Record<string, unknown>>);
		expect(arr.length).to.be.greaterThanOrEqual(1);
		const item = arr[0];
		expect(item).to.be.an('object').that.has.all.keys([
			'id',
			'name',
			'description',
		]);
		expect(item.id).to.be.a('number').that.equals(1);
		expect(item.name).to.be.a('string');
		expect(item.description).to.be.a('string');
	});

	it('Environment.create returns the expected type', async () => {
		const rndName = `Random Env ${randomUUID()}`;
		const description = 'Environment created via Integration testing';
		const response = await KiwiConnector.sendRPCMethod(
			'Environment.create',
			[{ name: rndName, description }]
		);
		expect(response).to.be.an('object').that.has.all.keys([
			'id',
			'name',
			'description',
		]);
		const item = response as Record<string, unknown>;
		expect(item.id).to.be.a('number');
		expect(item.name).to.be.a('string').that.equals(rndName);
		expect(item.description).to.be.a('string').that.equals(description);
	});
});
