import KiwiBaseItem from '../core/kiwiBaseItem';

export default class Priority extends KiwiBaseItem {
	
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}
	
	public getValue(): string {
		return this.serialized.value as string;
	}
	
	public static async getByValue(value: string): Promise<Priority> {
		const matches = await this.serverFilter({ value });
		if (matches.length === 0) {
			throw new Error(`Priority with value "${value}" was not found.`);
		}
		else {
			return matches[0];
		}
	}
	
	public isActive(): boolean {
		return this.serialized.is_active as boolean;
	}
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<Priority>> {
		return await super.serverFilter(filterObj) as Array<Priority>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Priority>> {
		return await super.getByIds(id) as Array<Priority>;
	}
	
	public static async getById(
		id: number
	): Promise<Priority> {
		return await super.getById(id) as Priority;
	}
	
	// ------------------------------------------------------------------------
}