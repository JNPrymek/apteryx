import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import Classification from './classification';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Classification', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const serverClass1 = {id: 1, name: 'Class1'};
	
	it('Can instantiate a Classification', () => {
		const initVals = serverClass1;
		const c1 = new Classification(initVals);
		
		expect(c1['serialized']).toEqual(initVals);
	});
	
	it('Can get Classification by ID', async () => {
		const serverItems: Array<Record<string, unknown>> = [serverClass1];
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: serverItems}));
		
		const class1 = await Classification.getById(1);
		expect(class1['serialized']).toEqual(serverItems[0]);
	});
	
	it('Can get Classification by Name', async () => {
		const serverItems: Array<Record<string, unknown>> = [serverClass1];
		mockAxios.post.mockResolvedValue(mockRpcResponse({result: serverItems}));
		
		const class1 = await Classification.getByName('Class1');
		expect(class1['serialized']).toEqual(serverItems[0]);
	});
	
});