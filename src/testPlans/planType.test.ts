import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import PlanType from './planType';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('PlanType', () => {
	
	const type1Vals = {
		id: 1,
		name: 'Unit',
		description: ''
	};

	const type2Vals = {
		id: 2,
		name: 'Regression',
		description: 'Test Description'
	};

	it('Can instantiate a new PlanType', () => {
		const type1 = new PlanType(type1Vals);
		expect(type1['serialized']).toEqual(type1Vals);
	});

	describe('Can access local properties', () => {
		const type1 = new PlanType(type1Vals);
		const type2 = new PlanType(type2Vals);

		it('Can get PlanType ID', () => {
			expect(type1.getId()).toEqual(1);
			expect(type2.getId()).toEqual(2);
		});

		it('Can get PlanType Name', () => {
			expect(type1.getName()).toEqual('Unit');
			expect(type2.getName()).toEqual('Regression');
		});

		it('Can get PlanType Description', () => {
			expect(type1.getDescription()).toEqual('');
			expect(type2.getDescription()).toEqual('Test Description');
		});
	});

	describe('Basic Server Functions', () => {
		const type1 = new PlanType(type1Vals);

		it('Can get PlanType by a single ID (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [type1Vals]}));
			const result = await PlanType.getById(1);
			expect(result).toEqual(type1);
		});

		it('Can get PlanType by single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			expect(PlanType.getById(1)).rejects.toThrowError('Could not find any PlanType with ID 1');
		});

		it('Can get PlanType by Name (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: [type1Vals]}));
			const cat = await PlanType.getByName('Unit');
			expect(cat).toEqual(type1);
		});

		it('Can get PlanType by Name (0 matches)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({result: []}));
			const name = 'Non-used name';
			expect(PlanType.getByName(name)).rejects.toThrowError(`PlanType with name "${name}" could not be found.`);
		});
	});
});