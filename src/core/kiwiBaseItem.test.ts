import axios from 'axios';

import KiwiConnector from './kiwiConnector';

import { kiwiTestServerInfo } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import KiwiBaseItem from './kiwiBaseItem';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import { mockTestCase } from '../../test/mockKiwiValues';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('KiwiBaseItem', () => {
	
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
		KiwiConnector.init({ hostName: kiwiTestServerInfo.hostName });
	});

	it('Can instantiate a KiwiBaseItem', () => {
		const initVals = { id: 1, a: 'valA', b: 'valB' };
		const kbi = new KiwiBaseItem(initVals);
		
		expect(kbi['serialized']).toEqual(initVals);
	});

	describe('Local Methods', () => {
	
		it('getId() returns the item ID', () => {
			const kbi = new KiwiBaseItem({ id: 123, otherKey: 'otherVal' });
			expect(kbi.getId()).toEqual(123);
		});
	
		it('Shows correct value for toString()', () => {
			const kbi = new KiwiBaseItem({ id: 123, otherKey: 'otherVal' });
			const kbiString = kbi.toString();
			expect(kbiString)
				.toEqual('KiwiBaseItem:{"id":123,"otherKey":"otherVal"}');
		});
	});

	describe('Server Methods', () => {
		it('Can get a single KiwiBaseItem by ID', async () => {
			const serverKbis = [{ id: 1, otherKey: 'otherVal' }];
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: serverKbis })
			);
			const kbi = await KiwiBaseItem.getById(1);
			expect(kbi['serialized']).toEqual(serverKbis[0]);
		});
		
		it('Can get multiple KiwiBaseItems by ID array', async () => {
			const serverKbis = [
				{ id: 1, otherKey: 'otherVal' }, 
				{ id: 2, otherKey: 'otherOtherVal' }
			];
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: serverKbis })
			);
			const kbi = await KiwiBaseItem.getByIds([1, 2]);
			expectArrayWithKiwiItem(kbi, serverKbis[0]);
			expectArrayWithKiwiItem(kbi, serverKbis[1]);
		});
		
		it('GetByIds can handle int', async () => {
			const serverKbis = [{ id: 1, otherKey: 'otherVal' }];
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: serverKbis })
			);
			const kbi = await KiwiBaseItem.getById(1);
			expect(kbi['serialized']).toEqual(serverKbis[0]);
		});
		
		it('GetByID throws error with invalid ID', async ()=> {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			expect(KiwiBaseItem.getById(1))
				.rejects
				.toThrowError('Could not find any KiwiBaseItem with ID 1');
		});

		it('Can update to latest values from server', async () => {
			const origServerVal = mockTestCase();
			const updatedServerVal = mockTestCase({
				summary: 'New and improved',
				text: 'This test case was updated by a different client.'
			});

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ origServerVal ]
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ updatedServerVal ]
			}));

			const kiwiItem = await KiwiBaseItem.getById(1);
			expect(kiwiItem['serialized']).toEqual(origServerVal);
			verifyRpcCall(
				mockAxios, 
				0, 
				'KiwiBaseItem.filter', 
				[{ id__in: [1] }]
			);
			await kiwiItem.syncServerValues();
			verifyRpcCall(mockAxios, 1, 'KiwiBaseItem.filter', [{ id: 1 }]);
			expect(kiwiItem['serialized']).toEqual(updatedServerVal);
		});
	});
});
