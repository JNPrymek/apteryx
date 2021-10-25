import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Version from './version';
import Build from './build';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Version', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const serverBuild1 = {
		id: 6, 
		name: 'Android', 
		version: 5, 
		'version__value': '1.1.2', 
		'is_active': true
	};
	
	const serverBuild2 = {
		id: 8, 
		name: 'Android', 
		version: 4, 
		'version__value': '1.0.0', 
		'is_active': false
	};
	
	const serverVer1 = {
		id: 5,
		value: '1.1.2',
		product: 3,
		'product__name': 'Flappy Bird'
	};
	
	it('Can instantiate a Build', () => {
		const build = new Build(serverBuild1);
		expect(build['serialized']).toEqual(serverBuild1);
	});
	
	// Build Properties
	it('Can get ID of Build', () => {
		const build = new Build(serverBuild1);
		expect(build.getId()).toEqual(6);
	});
	
	it('Can get Name of Build', () => {
		const build = new Build(serverBuild1);
		expect(build.getName()).toEqual('Android');
	});
	
	it('Can get Version of Build', async () => {
		const build = new Build(serverBuild1);
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverVer1]}));
		
		const versionExpected = new Version(serverVer1);
		const buildVer = await build.getVersion();
		
		expect(buildVer).toEqual(versionExpected);
		
		// Build's version properties should be correct
		expect(build.getVersionId()).toEqual(buildVer.getId());
		expect(build.getVersionValue()).toEqual(buildVer.getValue());
	});
	
	it('Can get Version ID of Build', () => {
		const build = new Build(serverBuild1);
		expect(build.getVersionId()).toEqual(5);
	});
	
	it('Can get Version Value of Build', () => {
		const build = new Build(serverBuild1);
		expect(build.getVersionValue()).toEqual('1.1.2');
	});
	
	it('Can get Active flag of Build', () => {
		const build = new Build(serverBuild1);
		expect(build.getIsActive()).toEqual(true);
	});
	
	it('Can get Build by ID', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverBuild1]}));
		const build = await Build.getById(6);
		
		expect(build['serialized']).toEqual(serverBuild1);
	});
	
	// Tests for getByName() with multiple possible scenarios
	
	it('Can get Build by Name - unique entry matches name', async () => {
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverBuild1]}));
		
		const build = await Build.getByName('Android');
		expect(build['serialized']).toEqual(serverBuild1);
	});
	
	it('Can get Build by Name - 0 entries matching name', async () => {
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
		
		const name = 'Non-used name';
		expect(Build.getByName(name)).rejects.toThrowError(`Build with name "${name}" could not be found.`);
	});
	
	it('Can get Build by Name - Multiple name matches require version to be specified', async () => {
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverBuild1, serverBuild2]}));
		
		const name = 'Android';
		expect(Build.getByName(name)).rejects.toThrowError(`Build '${name}' exists for multiple versions.  The 'version' param must be specified.`);
		
	});
	
	it('Can get Build by Name - Multiple name matches are filtered by Version ID', async () => {
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverBuild1, serverBuild2]}));
		
		const name = 'Android';
		const versionId = 5;
		
		const build = await Build.getByName(name, versionId);
		const buildExpect = new Build(serverBuild1);
		expect(build).toEqual(buildExpect);
		
	});
	
	it('Can get Build by Name - Multiple name matches are filtered by Version', async () => {
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverBuild1, serverBuild2]}));
		
		const name = 'Android';
		const version = new Version(serverVer1);
		
		const build = await Build.getByName(name, version);
		const buildExpect = new Build(serverBuild1);
		expect(build).toEqual(buildExpect);
		
	});
	
	it('Can get Build by Name - Error thrown when multiple name matches, but no version ID match.', async () => {
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverBuild1, serverBuild2]}));
		
		const name = 'Android';
		const versionId = 12;
		
		expect(Build.getByName(name, versionId)).rejects.toThrowError(`Build with name "${name}" could not be found.`);
		
	});

});