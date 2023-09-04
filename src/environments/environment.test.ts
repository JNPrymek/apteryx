import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import { mockEnvironment } from '../../test/mockKiwiValues';
import Environment from './environment';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Environment', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const env1Val = mockEnvironment();
	const env2Val = mockEnvironment({
		id: 2,
		name: 'Staging',
		description: 'Non-user-facing environment'
	});

	it('Can instantiate an Environment', () => {
		const env1 = new Environment(env1Val);
		expect(env1['serialized']).toEqual(env1Val);
		const env2 = new Environment(env2Val);
		expect(env2['serialized']).toEqual(env2Val);
	});

	describe('Access Local Properties', () => {
		const env1 = new Environment(env1Val);
		const env2 = new Environment(env2Val);

		it('Can get Environment Description', () => {
			expect(env1.getDescription())
				.toEqual('Live customer-facing environment');
			expect(env2.getDescription())
				.toEqual('Non-user-facing environment');
		});
	});

	describe('Server Lookups', () => {
		it('Can get Environment by ID (single)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ env1Val ]
			}));
			const result = await Environment.getById(1);
			verifyRpcCall(
				mockAxios,
				0,
				'Environment.filter',
				[{ id__in: [1] }]
			);
			expect(result).toEqual(new Environment(env1Val));
		});

		it('Can get Environment by Name', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ env1Val ]
			}));
			const envName = 'Production';
			const result = await Environment.getByName(envName);
			verifyRpcCall(
				mockAxios,
				0,
				'Environment.filter',
				[{ name: envName }]
			);
			expect(result).toEqual(new Environment(env1Val));
		});
	});

	describe('Server Updates', () => {
		it('Can create a new Environment', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: env2Val,
			}));
			const env2 = await Environment.create({
				name: env2Val.name,
				description: env2Val.description,
			});
			expect(env2).toEqual(new Environment(env2Val));
		});
	});
});
