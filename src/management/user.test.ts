import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import User from './user';
import { UserValues } from './user.type';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('User', () => {
	const rawValues: {
		alice: UserValues;
		bob: UserValues;
	} = {
		alice: {
			id: 1,
			username: 'alice',
			email: 'alice@example.com',
			first_name: 'Alice',
			last_name: 'Foo',
			is_active: true,
			is_staff: true,
			is_superuser: true,
		},
		bob: {
			id: 2,
			username: 'bob',
			email: 'bob@example.com',
			first_name: 'Bob',
			last_name: 'Bar',
			is_active: true,
			is_staff: false,
			is_superuser: false,
		},
	};
	it('Can instantiate a User object', () => {
		expect(new User(rawValues.alice)).toBeInstanceOf(User);
		expect(new User(rawValues.alice)).toHaveProperty(
			'serialized',
			rawValues.alice
		);
		expect(new User(rawValues.bob))
			.toHaveProperty('serialized', rawValues.bob);
	});

	describe('Access local properties', () => {
		const alice = new User(rawValues.alice);
		const bob = new User(rawValues.bob);

		it('Can get User username', () => {
			expect(alice.getUsername()).toEqual('alice');
			expect(bob.getUsername()).toEqual('bob');
		});

		it('Can get User name', () => {
			expect(alice.getName()).toEqual('alice');
			expect(bob.getName()).toEqual('bob');
		});

		it('Can get User first name', () => {
			expect(alice.getFirstName()).toEqual('Alice');
			expect(bob.getFirstName()).toEqual('Bob');
		});

		it('Can get User last name', () => {
			expect(alice.getLastName()).toEqual('Foo');
			expect(bob.getLastName()).toEqual('Bar');
		});

		it('Can get User email address', () => {
			expect(alice.getEmail()).toEqual('alice@example.com');
			expect(bob.getEmail()).toEqual('bob@example.com');
		});

		it('Can get User active flag', () => {
			expect(alice.isActive()).toEqual(true);
			expect(bob.isActive()).toEqual(true);
		});

		it('Can get User staff flag', () => {
			expect(alice.isStaff()).toEqual(true);
			expect(bob.isStaff()).toEqual(false);
		});

		it('Can get User superuser flag', () => {
			expect(alice.isSuperUser()).toEqual(true);
			expect(bob.isSuperUser()).toEqual(false);
		});
	});

	describe('Server Functions', () => {
		it('Can get a User via single ID', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [rawValues.alice] })
			);

			expect(await User.getById(1)).toEqual(new User(rawValues.alice));
		});

		it('Can get Users via a list of IDs', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [rawValues.alice, rawValues.bob] })
			);

			const expectResults = [
				new User(rawValues.alice),
				new User(rawValues.bob)
			];

			expect(await User.getByIds([1, 2]))
				.toEqual(expect.arrayContaining(expectResults));
		});

		it('Can get a User by their username', async () => {
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [rawValues.alice] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [rawValues.bob] })
			);

			expect(await User.getByUsername('alice'))
				.toEqual(new User(rawValues.alice));

			expect(await User.getByUsername('bob'))
				.toEqual(new User(rawValues.bob));
		});

		it('Can get a User by their name', async () => {
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [rawValues.alice] })
			);
			mockAxios.post.mockResolvedValueOnce(
				mockRpcResponse({ result: [rawValues.bob] })
			);

			expect(await User.getByName('alice'))
				.toEqual(new User(rawValues.alice));

			expect(await User.getByName('bob'))
				.toEqual(new User(rawValues.bob));
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
	});
});
