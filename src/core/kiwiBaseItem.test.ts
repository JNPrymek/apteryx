import KiwiConnector from './kiwiConnector';
import RequestHandler from './requestHandler';

import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import { mockTestCase } from '../../test/mockKiwiValues';
import { assertPostRequestData } from '../../test/networkMocks/assertPostRequestData';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import { kiwiTestServerInfo } from '../../test/testServerDetails';
import KiwiBaseItem from './kiwiBaseItem';

// Mock RequestHandler
jest.mock('./requestHandler');
// const mockRequest = RequestHandler as jest.Mocked<typeof RequestHandler>;
const mockPostRequest = RequestHandler.sendPostRequest as jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: serverKbis,
			}));
			const kbi = await KiwiBaseItem.getById(1);
			expect(kbi['serialized']).toEqual(serverKbis[0]);
		});

		it('Can get multiple KiwiBaseItems by ID array', async () => {
			const serverKbis = [
				{ id: 1, otherKey: 'otherVal' },
				{ id: 2, otherKey: 'otherOtherVal' },
			];
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: serverKbis,
			}));
			const kbi = await KiwiBaseItem.getByIds([1, 2]);
			expectArrayWithKiwiItem(kbi, serverKbis[0]);
			expectArrayWithKiwiItem(kbi, serverKbis[1]);
		});

		it('GetByIds can handle int', async () => {
			const serverKbis = [{ id: 1, otherKey: 'otherVal' }];
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: serverKbis,
			}));
			const kbi = await KiwiBaseItem.getById(1);
			expect(kbi['serialized']).toEqual(serverKbis[0]);
		});

		it('GetByID throws error with invalid ID', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));
			expect(KiwiBaseItem.getById(1))
				.rejects
				.toThrow('Could not find any KiwiBaseItem with ID 1');
		});

		it('Can update to latest values from server', async () => {
			const origServerVal = mockTestCase();
			const updatedServerVal = mockTestCase({
				summary: 'New and improved',
				text: 'This test case was updated by a different client.',
			});

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [origServerVal],
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [updatedServerVal],
			}));

			const kiwiItem = await KiwiBaseItem.getById(1);
			expect(kiwiItem['serialized']).toEqual(origServerVal);
			assertPostRequestData({
				mockPostRequest,
				method: 'KiwiBaseItem.filter',
				params: [{ id__in: [1] }],
			});
			await kiwiItem.syncServerValues();
			assertPostRequestData({
				mockPostRequest,
				method: 'KiwiBaseItem.filter',
				params: [{ id: 1 }],
				callIndex: 1,
			});
			expect(kiwiItem['serialized']).toEqual(updatedServerVal);
		});
	});
});
