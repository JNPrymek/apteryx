import { expect } from 'chai';
import { randomUUID } from 'crypto';
import { before, describe, it } from 'mocha';
import KiwiConnector from '../../src/core/kiwiConnector';
import { kiwiTestServerInfo } from '../testServerDetails';

describe('Kiwi RPC API - Environment', () => {
	before(async () => {
		KiwiConnector.init(kiwiTestServerInfo);
		await KiwiConnector.login(
			kiwiTestServerInfo.username,
			kiwiTestServerInfo.password,
		);
	});

	it('Environment.filter returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Environment.filter',
			[{ id: 1 }],
		);
		expect(response).to.be.an('array');
		const arr = response as Array<Record<string, unknown>>;
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
			[{ name: rndName, description }],
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

	it('Environment.properties returns the expected type', async () => {
		const response = await KiwiConnector.sendRPCMethod(
			'Environment.properties',
			[{ id: 1 }],
		);
		expect(response).to.be.an('array');
		const arr = response as Array<Record<string, unknown>>;
		expect(arr.length).equals(1);
		const item = arr[0];
		expect(item).to.be.an('object').that.has.all.keys([
			'id',
			'environment',
			'name',
			'value',
		]);
		expect(item.id).to.be.a('number').that.equals(1);
		expect(item.environment).to.be.a('number');
		expect(item.name).to.be.a('string');
		expect(item.value).to.be.a('string');
	});

	// Environment to use for adding/removing properties
	const environmentWithProps = 3;
	const testPropName = 'EnvProp Integration Test';

	it('Environment.add_property returns the expected type', async () => {
		const value = randomUUID();
		const response = await KiwiConnector.sendRPCMethod(
			'Environment.add_property',
			[environmentWithProps, testPropName, value],
		);
		expect(response).to.be.an('object').that.has.all.keys([
			'id',
			'environment',
			'name',
			'value',
		]);
		const item = response as Record<string, unknown>;
		expect(item.id).to.be.a('number');
		expect(item.environment).to.equal(environmentWithProps);
		expect(item.name).to.equal(testPropName);
		expect(item.value).to.equal(value);
	});

	it('Environment.remove_property returns the expected type', async () => {
		const result = await KiwiConnector.sendRPCMethod(
			'Environment.remove_property',
			[{ environment: environmentWithProps, name: testPropName }],
		);
		expect(result).to.be.null;
	});
});
