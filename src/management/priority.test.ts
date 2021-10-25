import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';
import Priority from './priority';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Priority', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const serverPriority1 = { id: 1, value: 'P1', 'is_active': true };
	const serverPriority2 = { id: 2, value: 'P2', 'is_active': false };
	
	it('Can instantiate a Priority', () => {
		
		const priority = new Priority(serverPriority1);
		
		expect(priority['serialized']).toEqual(serverPriority1);
	});
	
	it('Can get Priority by ID', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverPriority1]}));
		const priority = await Priority.getById(1);
		
		expect(priority['serialized']).toEqual(serverPriority1);
	});
	
	it('Can get multiple Priorities by IDs', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverPriority1, serverPriority2]}));
		const vers = await Priority.getByIds([1, 2]);
		
		expectArrayWithKiwiItem(vers, serverPriority1);
		expectArrayWithKiwiItem(vers, serverPriority2);
	});
	
	it('Can read the value of the Priority', () => {
		
		const priority = new Priority(serverPriority1);
		
		expect(priority.getValue()).toEqual('P1');
	});
	
	it('Can get Priority by Value', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: [serverPriority1]}));
		const priority = await Priority.getByValue('P1');
		
		expect(priority['serialized']).toEqual(serverPriority1);
	});
	
	it('Can get Priority by Value - Throw error if no matches', async () => {
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
		const value = 'Bad Priority';
		expect(Priority.getByValue(value)).rejects.toThrowError(`Priority with value "${value}" was not found.`);
	});
	
	it('Can read if Priority is active', () => {
		
		const p1 = new Priority(serverPriority1);
		const p2 = new Priority(serverPriority2);
		
		expect(p1.getIsActive()).toEqual(true);
		expect(p2.getIsActive()).toEqual(false);
	});
	
});