import KiwiBaseItem from './kiwiBaseItem';

export default class KiwiNamedItem extends KiwiBaseItem {
	
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}
	
	public static async getByName(
		name: string
	): Promise<KiwiNamedItem> {
		
		const results = await this.serverFilter({name: name});
		if (results.length == 0) {
			throw new Error(`${this.name} with name "${name}" could not be found.`);
		}
		else {
			return results[0] as KiwiNamedItem;
		}
	}
	
	public getName(): string {
		return this.serialized.name as string;
	}
	
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<KiwiBaseItem>> {
		return await super.serverFilter(filterObj) as Array<KiwiNamedItem>;
	}
	
	// Kiwi Base
	// --------------------------------
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<KiwiBaseItem>> {
		return await super.getByIds(id) as Array<KiwiNamedItem>;
	}
	
	public static async getById(
		id: number
	): Promise<KiwiBaseItem> {
		return await super.getById(id) as KiwiNamedItem;
	}
	
}