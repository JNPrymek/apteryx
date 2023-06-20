import axios from 'axios';

import Priority from './priority';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import { 
	mockPriority 
} from '../../test/mockValues/management/mockManagementValues';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Priority', () => {
	
	const priority1Vals = mockPriority();
	const priority2Vals = mockPriority({
		id: 2,
		value: 'P2',
		is_active: false
	});
	
	it('Can instantiate a Priority', () => {
		const priority1 = new Priority(priority1Vals);
		expect(priority1['serialized']).toEqual(priority1Vals);
		const priority2 = new Priority(priority2Vals);
		expect(priority2['serialized']).toEqual(priority2Vals);
	});
	
	describe('Access Local Properties', () => {
		
		const priority1 = new Priority(priority1Vals);
		const priority2 = new Priority(priority2Vals);
		
		it('Can read the value of the Priority', () => {
			expect(priority1.getValue()).toEqual('P1');
			expect(priority2.getValue()).toEqual('P2');
		});
	
		it('Can read if Priority is active', () => {
			expect(priority1.isActive()).toEqual(true);
			expect(priority2.isActive()).toEqual(false);
		});
	});
	
	describe('Server Lookups', () => {
		it('Can get Priority by ID', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [priority1Vals] 
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [priority2Vals] 
			}));
			const priority1 = await Priority.getById(1);
			const priority2 = await Priority.getById(2);
			
			expect(priority1['serialized']).toEqual(priority1Vals);
			expect(priority2['serialized']).toEqual(priority2Vals);
		});
		
		it('Can get multiple Priorities by IDs', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [priority1Vals, priority2Vals] 
			}));
			const priorities = await Priority.getByIds([1, 2]);
		
			expectArrayWithKiwiItem(priorities, priority1Vals);
			expectArrayWithKiwiItem(priorities, priority2Vals);
		});
	
	
		it('Can get Priority by Value', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [priority1Vals] 
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [priority2Vals] 
			}));
			
			const priority1 = await Priority.getByValue('P1');
			const priority2 = await Priority.getByValue('P2');
			
			expect(priority1['serialized']).toEqual(priority1Vals);
			expect(priority2['serialized']).toEqual(priority2Vals);
		});
	
		it('Throws error if no matches when fetching by Value', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			const value = 'Bad Priority';
			expect(Priority.getByValue(value))
				.rejects
				.toThrowError(`Priority with value "${value}" was not found.`);
		});
	});
});
