import axios from 'axios';

import KiwiConnector from './kiwiConnector';

import { kiwiTestServerInfo } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import KiwiNamedItem from './kiwiNamedItem';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('KiwiNamedItem', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
		KiwiConnector.init({ hostName: kiwiTestServerInfo.hostName });
	});
	
	it('Can instantiate a KiwiNamedItem', () => {
		const initVals = { id: 1, name: 'NamedItem1', b: 'valB' };
		const kbi = new KiwiNamedItem(initVals);
		
		expect(kbi['serialized']).toEqual(initVals);
	});
	
	it('Can get name of KiwiNamedItem', () => {
		const bob = new KiwiNamedItem({ id: 1, name: 'Bob', b: 'valB' });
		expect(bob.getName()).toEqual('Bob');
	});
	
	it('Can get a named item by name', async () => {
		const serverItems = [{ id: 1, name: 'Bob', b: 'valB' }];
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: serverItems })
		);
		
		const bob = await KiwiNamedItem.getByName('Bob');
		expect(bob['serialized']).toEqual(serverItems[0]);
	});
	
	it('Throws error when getting non-existent name', async () => {
		const serverItems: Array<Record<string, unknown>> = [];
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: serverItems })
		);
		
		expect(KiwiNamedItem.getByName('Bob'))
			.rejects
			.toThrowError('KiwiNamedItem with name "Bob" could not be found.');
	});
	
	it('Can get a single KiwiNamedItem by ID', async () => {
		const serverItems = [{ id: 1, otherKey: 'otherVal' }];
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: serverItems })
		);
		const kbi = await KiwiNamedItem.getById(1);
		expect(kbi['serialized']).toEqual(serverItems[0]);
	});
	
	it('Can get multiple KiwiNamedItem by ID array', async () => {
		const serverItems = [
			{ id: 1, name: 'Bob', otherKey: 'otherVal' }, 
			{ id: 2, name: 'Stuart', otherKey: 'otherOtherVal' }
		];
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: serverItems })
		);
		const kbi = await KiwiNamedItem.getByIds([1, 2]);
		expectArrayWithKiwiItem(kbi, serverItems[0]);
		expectArrayWithKiwiItem(kbi, serverItems[1]);
	});
	
});
