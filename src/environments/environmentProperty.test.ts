import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

import EnvironmentProperty from './environmentProperty';
import { mockEnvironmentProperty } from '../../test/mockKiwiValues';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('EnvironmentProperty', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const propVals = [
		mockEnvironmentProperty(),
		mockEnvironmentProperty({ id: 2, name: 'fizz', value: 'buzz' })
	];

	it('Can instantiate an EnvironmentProperty', () => {
		const prop1 = new EnvironmentProperty(propVals[0]);
		expect(prop1['serialized']).toEqual(propVals[0]);
	});

	describe('Access local properties', () => {
		const prop1 = new EnvironmentProperty(propVals[0]);
		const prop2 = new EnvironmentProperty(propVals[1]);

		it('Can get EnvironmentProperty ID', () => {
			expect(prop1.getId()).toEqual(1);
			expect(prop2.getId()).toEqual(2);
		});

		it('Can get EnvironmentProperty Environment ID', () => {
			expect(prop1.getEnvironmentId()).toEqual(1);
			expect(prop2.getEnvironmentId()).toEqual(1);
		});

		it('Can get EnvironmentProperty Name', () => {
			expect(prop1.getName()).toEqual('Foo');
			expect(prop2.getName()).toEqual('fizz');
		});

		it('Can get EnvironmentProperty Value', () => {
			expect(prop1.getValue()).toEqual('Bar');
			expect(prop2.getValue()).toEqual('buzz');
		});
	});

	describe('Server Lookups', () => {
		it('Can get an EnvironmentProperty By ID (1 match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					propVals[0]
				]
			}));
			expect(await EnvironmentProperty.getById(1))
				.toEqual(new EnvironmentProperty(propVals[0]));
		});

		it('Can get an EnvironmentProperty By ID (2 matches)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					propVals[0],
					propVals[1],
				]
			}));
			const result = await EnvironmentProperty.getByIds([1, 2]);
			expect(result).toEqual(expect.arrayContaining([
				new EnvironmentProperty(propVals[0]),
				new EnvironmentProperty(propVals[1]),
			]));
		});

		it('Can get an EnvironmentProperty by ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: []
			}));
			expect(EnvironmentProperty.getById(1))
				.rejects
				.toThrowError(
					'Could not find any Environment Property with ID 1'
				);
		});
	});
});
