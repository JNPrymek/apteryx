import KiwiNamedItem from '../core/kiwiNamedItem';
import { UserValues } from './user.type';

export default class User extends KiwiNamedItem {
	constructor(serializedValues: UserValues) {
		super(serializedValues);
	}

	public getEmail(): string {
		return this.serialized.email as string;
	}

	public getUsername(): string {
		return this.serialized.username as string;
	}

	public getFirstName(): string {
		return this.serialized.first_name as string;
	}

	public getLastName(): string {
		return this.serialized.last_name as string;
	}

	public isActive(): boolean {
		return this.serialized.is_active as boolean;
	}

	public isStaff(): boolean {
		return this.serialized.is_staff as boolean;
	}

	public isSuperUser(): boolean {
		return this.serialized.is_superuser as boolean;
	}

	public static async getByUsername(name: string): Promise<User> {
		const results = await this.serverFilter({username: name});
		if (results.length == 0) {
			throw new Error(`User with username "${name}" could not be found.`);
		}
		else {
			return results[0] as User;
		}
	}

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------

	public getName(): string {
		return this.getUsername();
	}

	public static async getByName(
		name: string
	): Promise<User> {
		return this.getByUsername(name);
	}
	
	
	public static async serverFilter(
		filterObj: Partial<UserValues>
	): Promise<Array<User>> {
		return await super.serverFilter(filterObj) as Array<User>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<User>> {
		return await super.getByIds(id) as Array<User>;
	}
	
	public static async getById(
		id: number
	): Promise<User> {
		return await super.getById(id) as User;
	}
}