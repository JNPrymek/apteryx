import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import {
	mockEnvironment,
	mockEnvironmentProperty
} from '../../test/mockKiwiValues';
import Environment from './environment';
import EnvironmentProperty from './environmentProperty';

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

		describe('Environment Properties', () => {
			const propVals = [
				mockEnvironmentProperty(),
				mockEnvironmentProperty({ id: 2, name: 'fizz', value: 'buzz' }),
			];
			it('Can get Environment Properties', async () => {
				mockAxios.post.mockResolvedValue(mockRpcResponse({
					result: propVals
				}));
				const env1 = new Environment(mockEnvironment());
				const props = await env1.getProperties();
				expect(props).toEqual(expect.arrayContaining([
					new EnvironmentProperty(propVals[0]),
					new EnvironmentProperty(propVals[1]),
				]));
				verifyRpcCall(
					mockAxios,
					0,
					'Environment.properties',
					[{ environment: 1 }]
				);
			});

			it('Can get Environment Property names', async () => {
				mockAxios.post.mockResolvedValue(mockRpcResponse({
					result: propVals
				}));
				const env1 = new Environment(mockEnvironment());
				const names = await env1.getPropertyKeys();
				verifyRpcCall(
					mockAxios,
					0,
					'Environment.properties',
					[{ environment: 1 }]
				);
				expect(names).toEqual(['Foo', 'fizz']);
			});

			it('Can get Environment Property values', async () => {
				mockAxios.post.mockResolvedValue(mockRpcResponse({
					result: [
						propVals[1],
						mockEnvironmentProperty({
							id: 3,
							name: 'fizz',
							value: 'fizzbuzz'
						}),
						mockEnvironmentProperty({
							id: 3,
							name: 'fizz',
							value: 'fizbin'
						}),
					]
				}));
				const env1 = new Environment(mockEnvironment());
				const names = await env1.getPropertyValues('fizz');
				verifyRpcCall(
					mockAxios,
					0,
					'Environment.properties',
					[{ environment: 1, name: 'fizz' }]
				);
				expect(names).toEqual(['buzz', 'fizzbuzz', 'fizbin']);
			});
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
