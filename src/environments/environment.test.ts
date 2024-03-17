import { describe, it, expect } from '@jest/globals';
import {
	mockEnvironment,
	mockEnvironmentProperty
} from '../../test/mockKiwiValues';
import Environment from './environment';
import EnvironmentProperty from './environmentProperty';
import RequestHandler from '../core/requestHandler';
import mockRpcNetworkResponse from '../../test/networkMocks/mockPostResponse';
import {
	assertPostRequestData
} from '../../test/networkMocks/assertPostRequestData';

// Mock RequestHandler
jest.mock('../core/requestHandler');
const mockPostRequest =
	RequestHandler.sendPostRequest as
	jest.MockedFunction<typeof RequestHandler.sendPostRequest>;

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
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ env1Val ]
			}));
			const result = await Environment.getById(1);
			assertPostRequestData({
				mockPostRequest,
				method: 'Environment.filter',
				params: [{ id__in: [1] }],
			});
			expect(result).toEqual(new Environment(env1Val));
		});

		it('Can get Environment by Name', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: [ env1Val ]
			}));

			const envName = 'Production';
			const result = await Environment.getByName(envName);
			assertPostRequestData({
				mockPostRequest,
				method: 'Environment.filter',
				params: [{ name: envName }],
			});
			expect(result).toEqual(new Environment(env1Val));
		});

		describe('Environment Properties', () => {
			const propVals = [
				mockEnvironmentProperty(),
				mockEnvironmentProperty({ id: 2, name: 'fizz', value: 'buzz' }),
			];

			it('Can get Environment Properties', async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: propVals
				}));
				const env1 = new Environment(mockEnvironment());
				const props = await env1.getProperties();
				expect(props).toEqual(expect.arrayContaining([
					new EnvironmentProperty(propVals[0]),
					new EnvironmentProperty(propVals[1]),
				]));
				assertPostRequestData({
					mockPostRequest,
					method: 'Environment.properties',
					params: [{ environment: 1 }],
				});
			});

			it('Can get Environment Property names', async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: propVals
				}));
				const env1 = new Environment(mockEnvironment());
				const names = await env1.getPropertyKeys();
				assertPostRequestData({
					mockPostRequest,
					method: 'Environment.properties',
					params: [{ environment: 1 }],
				});
				expect(names).toEqual(['Foo', 'fizz']);
			});

			it('Can get Environment Property values', async () => {
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
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
				assertPostRequestData({
					mockPostRequest,
					method: 'Environment.properties',
					params: [{ environment: 1, name: 'fizz' }],
				});
				expect(names).toEqual(['buzz', 'fizzbuzz', 'fizbin']);
			});
		});
	});

	describe('Server Updates', () => {
		it('Can create a new Environment', async () => {
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: env2Val,
			}));
			const env2 = await Environment.create({
				name: env2Val.name,
				description: env2Val.description,
			});
			assertPostRequestData({
				mockPostRequest,
				method: 'Environment.create',
				params: [{
					name: env2Val.name,
					description: env2Val.description,
				}],
			});
			expect(env2).toEqual(new Environment(env2Val));
		});

		it('Can add a property to the Environment', async () => {
			const propVal = mockEnvironmentProperty();
			mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
				result: propVal
			}));
			const env1 = new Environment(mockEnvironment());
			const envProp = await env1.addProperty('Foo', 'Bar');
			assertPostRequestData({
				mockPostRequest,
				method: 'Environment.add_property',
				params: [1, 'Foo', 'Bar'],
			});
			expect(envProp).toEqual(new EnvironmentProperty(propVal));
		});

		it('Can remove a specific property value from the Environment',
			async () => {
				const propVal = mockEnvironmentProperty();
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: null
				}));
				const env1 = new Environment(mockEnvironment());
				await env1.removeProperty(propVal.name, propVal.value);
				assertPostRequestData({
					mockPostRequest,
					method: 'Environment.remove_property',
					params: [{
						environment: 1,
						name: propVal.name,
						value: propVal.value
					}],
				});
			});

		it('Can remove all values for a specific property from the Environment',
			async () => {
				const propVal = mockEnvironmentProperty();
				mockPostRequest.mockResolvedValue(mockRpcNetworkResponse({
					result: null
				}));
				const env1 = new Environment(mockEnvironment());
				await env1.removeProperty(propVal.name);
				assertPostRequestData({
					mockPostRequest,
					method: 'Environment.remove_property',
					params: [{
						environment: 1,
						name: propVal.name
					}],
				});
			});
	});
});
