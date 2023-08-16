import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

import TestCase from './testCase';
import Priority from '../management/priority';
import Category from './category';
import TestCaseStatus from './testCaseStatus';
import {
	mockComponent,
	mockComponentServerEntry,
	mockPriority,
	mockTag,
	mockTagServerEntry,
	mockTestCase,
	mockTestCaseStatus,
	mockUser,
} from '../../test/mockKiwiValues';
import User from '../management/user';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';
import {
	TestCaseCreateValues,
	TestCaseWriteValues
} from './testCase.type';
import { TestCasePropertyValues } from './testCaseProperty.type';
import { 
	mockTestCaseProperty,
	mockTestCaseUpdateResponse 
} from '../../test/mockValues/testCases/mockTestCaseValues';
import Component from '../management/component';
import Tag from '../management/tag';
import TestCaseProperty from './testCaseProperty';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('TestCaseProperty', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const propVals = [
		mockTestCaseProperty(),
		mockTestCaseProperty({ id: 2, name: 'fizz', value: 'buzz' }),
	];

	it('Can instantiate a TestCaseProperty', () => {
		const prop1 = new TestCaseProperty(propVals[0]);
		expect(prop1['serialized']).toEqual(propVals[0]);
	});

	describe('Access local properties', () => {
		const prop1 = new TestCaseProperty(propVals[0]);
		const prop2 = new TestCaseProperty(propVals[1]);

		it('Can get TestCaseProperty ID', () => {
			expect(prop1.getId()).toEqual(1);
			expect(prop2.getId()).toEqual(2);
		});

		it('Can get TestCaseProperty TestCase ID', () => {
			expect(prop1.getCaseId()).toEqual(1);
			expect(prop2.getCaseId()).toEqual(1);
		});

		it('Can get TestCaseProperty Name', () => {
			expect(prop1.getName()).toEqual('foo');
			expect(prop2.getName()).toEqual('fizz');
		});

		it('Can get TestCaseProperty ID', () => {
			expect(prop1.getValue()).toEqual('bar');
			expect(prop2.getValue()).toEqual('buzz');
		});
	});

	describe('Server Lookups', () => {
		it('Can get a TestCaseProperty by ID (1 match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [
					propVals[0]
				]
			}));
			expect(await TestCaseProperty.getById(1))
				.toEqual(new TestCaseProperty(propVals[0]));
		});

		it('Can get a TestCaseProperty by ID (2 matches)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [
					propVals[0],
					propVals[1]
				]
			}));
			const result = await TestCaseProperty.getByIds([1, 2]);
			expect(result).toEqual(expect.arrayContaining([
				new TestCaseProperty(propVals[0]),
				new TestCaseProperty(propVals[1])
			]));
		});

		it('Can get a TestCaseProperty by ID (No match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: []
			}));
			expect(TestCaseProperty.getById(1))
				.rejects
				.toThrowError('Could not find any TestCase Property with ID 1');
		});
	});
});
