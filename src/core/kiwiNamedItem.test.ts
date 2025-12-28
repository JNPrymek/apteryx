import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import { kiwiTestServerInfo } from '../../test/testServerDetails';
import KiwiConnector from './kiwiConnector';
import KiwiNamedItem from './kiwiNamedItem';
import RequestHandler from './requestHandler';

// Mock RequestHandler
jest.mock('./requestHandler');
const mockPostRequest = RequestHandler.sendPostRequest as jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

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
		mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
			result: serverItems,
		}));

		const bob = await KiwiNamedItem.getByName('Bob');
		expect(bob['serialized']).toEqual(serverItems[0]);
	});

	it('Throws error when getting non-existent name', async () => {
		const serverItems: Array<Record<string, unknown>> = [];
		mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
			result: serverItems,
		}));

		expect(KiwiNamedItem.getByName('Bob'))
			.rejects
			.toThrow('KiwiNamedItem with name "Bob" could not be found.');
	});

	it('Can get a single KiwiNamedItem by ID', async () => {
		const serverItems = [{ id: 1, otherKey: 'otherVal' }];
		mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
			result: serverItems,
		}));
		const kbi = await KiwiNamedItem.getById(1);
		expect(kbi['serialized']).toEqual(serverItems[0]);
	});

	it('Can get multiple KiwiNamedItem by ID array', async () => {
		const serverItems = [
			{ id: 1, name: 'Bob', otherKey: 'otherVal' },
			{ id: 2, name: 'Stuart', otherKey: 'otherOtherVal' },
		];
		mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
			result: serverItems,
		}));
		const kbi = await KiwiNamedItem.getByIds([1, 2]);
		expectArrayWithKiwiItem(kbi, serverItems[0]);
		expectArrayWithKiwiItem(kbi, serverItems[1]);
	});
});
