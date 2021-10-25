import KiwiConnector from './kiwiConnector';

export default class KiwiBaseItem {
	protected serialized: Record<string, unknown>;
	
	constructor(serializedValues: Record<string, unknown>) {
		this.serialized = serializedValues;
	}
	
	public getId(): number {
		return this.serialized.id as number;
	}
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<KiwiBaseItem>> {
			
		const response = await KiwiConnector.sendRPCMethod(`${this.name}.filter`, [filterObj]) as Array<Record<string, unknown>>;
		const results: Array<KiwiBaseItem> = [];
		
		for (const item of response) {
			const newItem = new this(item);
			results.push(newItem);
		}
		return results;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<KiwiBaseItem>> {
			
		const idArr = Array.isArray(id) ? id : [ id ];
		return await this.serverFilter({'id__in' : idArr });
	}
	
	public static async getById(
		id: number
	): Promise<KiwiBaseItem> {
		const arrResult = await this.getByIds(id);
		if (arrResult.length == 0) {
			throw new Error(`Could not find any ${this.name} with ID ${id}`);
		}
		return arrResult[0];
	}
	
	public toString(): string {
		return `${this.constructor.name}:${JSON.stringify(this.serialized)}`;
	}
}