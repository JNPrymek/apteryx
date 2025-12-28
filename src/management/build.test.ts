import { describe, expect, it } from '@jest/globals';
import { mockBuild, mockVersion } from '../../test/mockKiwiValues';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import RequestHandler from '../core/requestHandler';
import Build from './build';
import Version from './version';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest = RequestHandler.sendPostRequest as jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

describe('Version', () => {
	const build1Vals = mockBuild();
	const build2Vals = mockBuild({
		id: 2,
		name: 'Android',
		version: 4,
		version__value: '1.1.2',
		is_active: false,
	});
	const build3Vals = mockBuild({
		id: 3,
		name: 'Android',
	});

	const version1Vals = mockVersion();
	const version4Vals = mockVersion({
		id: 4,
		value: '1.1.2',
		product: 3,
		product__name: 'Flappy Bird',
	});

	it('Can instantiate a Build', () => {
		const build1 = new Build(build1Vals);
		expect(build1['serialized']).toEqual(build1Vals);
		const build2 = new Build(build2Vals);
		expect(build2['serialized']).toEqual(build2Vals);
	});

	describe('Access Local Properties', () => {
		const build1 = new Build(build1Vals);
		const build2 = new Build(build2Vals);

		it('Can get ID of Build', () => {
			expect(build1.getId()).toEqual(1);
			expect(build2.getId()).toEqual(2);
		});

		it('Can get Name of Build', () => {
			expect(build1.getName()).toEqual('unspecified');
			expect(build2.getName()).toEqual('Android');
		});

		it('Can get Version of Build', async () => {
			const version1 = new Version(version1Vals);
			const version4 = new Version(version4Vals);

			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [version1Vals],
			}));
			mockPostRequest.mockResolvedValueOnce(mockRpcNetworkResponse({
				result: [version4Vals],
			}));

			const build1Version = await build1.getVersion();
			const build2Version = await build2.getVersion();

			expect(build1Version).toEqual(version1);
			expect(build2Version).toEqual(version4);
		});

		it('Can get Version ID of Build', () => {
			expect(build1.getVersionId()).toEqual(1);
			expect(build2.getVersionId()).toEqual(4);
		});

		it('Can get Version Value of Build', () => {
			expect(build1.getVersionValue()).toEqual('unspecified');
			expect(build2.getVersionValue()).toEqual('1.1.2');
		});

		it('Can get Active flag of Build', () => {
			expect(build1.getIsActive()).toEqual(true);
			expect(build2.getIsActive()).toEqual(false);
		});
	});

	describe('Server Lookups', () => {
		it('Can get Build by ID', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build1Vals],
			}));
			const build = await Build.getById(6);

			expect(build['serialized']).toEqual(build1Vals);
		});

		it('Can get Build by Name - unique entry matches name', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build1Vals],
			}));

			const build = await Build.getByName('Android');
			expect(build['serialized']).toEqual(build1Vals);
		});

		it('Can get Build by Name - 0 entries matching name', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [],
			}));

			const name = 'Non-used name';
			expect(Build.getByName(name))
				.rejects
				.toThrow(`Build with name "${name}" could not be found.`);
		});

		it('Can get Build by Name - Multiple name matches require version to be specified', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build2Vals, build3Vals],
			}));

			const name = 'Android';
			expect(Build.getByName(name))
				.rejects
				.toThrow(`Build '${name}' exists for multiple versions.  The 'version' param must be specified.`);
		});

		it('Can get Build by Name - Multiple name matches are filtered by Version ID', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build2Vals, build3Vals],
			}));

			const name = 'Android';
			const versionId = 4;

			const actualBuild = await Build.getByName(name, versionId);
			expect(actualBuild).toEqual(new Build(build2Vals));
		});

		it('Can get Build by Name - Multiple name matches are filtered by Version', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build2Vals, build3Vals],
			}));

			const name = 'Android';
			const version4 = new Version(version4Vals);

			const actualBuild = await Build.getByName(name, version4);
			expect(actualBuild).toEqual(new Build(build2Vals));
		});

		it('Can get Build by Name - Error thrown when multiple name matches, but no version ID match.', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [build2Vals, build3Vals],
			}));

			const name = 'Android';
			const versionId = 12;

			expect(Build.getByName(name, versionId))
				.rejects
				.toThrow(`Build with name "${name}" could not be found.`);
		});
	});
});
