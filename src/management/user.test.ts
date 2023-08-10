import axios from 'axios';
import { describe, it, expect } from '@jest/globals';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import User from './user';
import { mockUser } from '../../test/mockKiwiValues';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('User', () => {

	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	const user1Vals = mockUser();
	const user2Vals = mockUser({
		id: 2,
		username: 'bob',
		email: 'bob@example.com',
		first_name: 'Bob',
		last_name: 'Bar',
		is_active: true,
		is_staff: false,
		is_superuser: false,
	});
	
	it('Can instantiate a User object', () => {
		expect(new User(user1Vals)).toBeInstanceOf(User);
		expect(new User(user1Vals)).toHaveProperty(
			'serialized',
			user1Vals
		);
		expect(new User(user2Vals))
			.toHaveProperty('serialized', user2Vals);
	});

	describe('Access local properties', () => {
		const user1 = new User(user1Vals);
		const user2 = new User(user2Vals);

		it('Can get User username', () => {
			expect(user1.getUsername()).toEqual('alice');
			expect(user2.getUsername()).toEqual('bob');
		});

		it('Can get User name', () => {
			expect(user1.getName()).toEqual('alice');
			expect(user2.getName()).toEqual('bob');
		});

		it('Can get User first name', () => {
			expect(user1.getFirstName()).toEqual('Alice');
			expect(user2.getFirstName()).toEqual('Bob');
		});

		it('Can get User last name', () => {
			expect(user1.getLastName()).toEqual('Foo');
			expect(user2.getLastName()).toEqual('Bar');
		});

		it('Can get User email address', () => {
			expect(user1.getEmail()).toEqual('alice@example.com');
			expect(user2.getEmail()).toEqual('bob@example.com');
		});

		it('Can get User active flag', () => {
			expect(user1.isActive()).toEqual(true);
			expect(user2.isActive()).toEqual(true);
		});

		it('Can get User staff flag', () => {
			expect(user1.isStaff()).toEqual(true);
			expect(user2.isStaff()).toEqual(false);
		});

		it('Can get User superuser flag', () => {
			expect(user1.isSuperUser()).toEqual(true);
			expect(user2.isSuperUser()).toEqual(false);
		});
	});

	describe('Server Functions', () => {
		it('Can get a User via single ID', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [user1Vals] })
			);

			expect(await User.getById(1)).toEqual(new User(user1Vals));
		});

		it('Can get Users via a list of IDs', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [user1Vals, user2Vals] })
			);

			const expectResults = [
				new User(user1Vals),
				new User(user2Vals)
			];

			expect(await User.getByIds([1, 2]))
				.toEqual(expect.arrayContaining(expectResults));
		});

		it('Can get a User by their username', async () => {
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user1Vals] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user2Vals] })
			);

			expect(await User.getByUsername('alice'))
				.toEqual(new User(user1Vals));

			expect(await User.getByUsername('bob'))
				.toEqual(new User(user2Vals));
		});

		it('Can get a User by their name', async () => {
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user1Vals] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [user2Vals] })
			);

			expect(await User.getByName('alice'))
				.toEqual(new User(user1Vals));

			expect(await User.getByName('bob'))
				.toEqual(new User(user2Vals));
		});

		it('Throws error when getting User with invalid username', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [] })
			);

			expect(User.getByUsername('charlie'))
				.rejects.toThrowError(
					'User with username "charlie" could not be found.'
				);
		});

		it('Can resolve ID from number', async () => {
			expect(User.resolveUserId(1)).resolves.toEqual(1);
			expect(User.resolveUserId(3)).resolves.toEqual(3);
			expect(User.resolveUserId(156)).resolves.toEqual(156);
		});

		it('Can resolve ID from User', async () => {
			const alice = new User(user1Vals);
			const bob = new User(user2Vals);
			expect(User.resolveUserId(alice)).resolves.toEqual(1);
			expect(User.resolveUserId(bob)).resolves.toEqual(2);
		});

		it('Can resolve ID from username', async () => {
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ user1Vals ]
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [ user2Vals ]
			}));

			expect(await User.resolveUserId('alice')).toEqual(1);
			expect(await User.resolveUserId('bob')).toEqual(2);
			verifyRpcCall(
				mockAxios, 
				0, 
				'User.filter', 
				[ { username: 'alice' }]
			);
			verifyRpcCall(
				mockAxios, 
				1, 
				'User.filter', 
				[ { username: 'bob' }]
			);
		});
	});
});
