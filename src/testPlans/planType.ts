import KiwiNamedItem from '../core/kiwiNamedItem';

export default class PlanType extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getDescription(): string {
		return this.serialized['description'] as string;
	}

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<PlanType> {
		return await super.getByName(name) as PlanType;
	}
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<PlanType>> {
		return await super.serverFilter(filterObj) as Array<PlanType>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<PlanType>> {
		return await super.getByIds(id) as Array<PlanType>;
	}
	
	public static async getById(
		id: number
	): Promise<PlanType> {
		return await super.getById(id) as PlanType;
	}
	
	// ------------------------------------------------------------------------
}
