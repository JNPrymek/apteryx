import KiwiNamedItem from '../core/kiwiNamedItem';
import Classification from './classification';

export default class Product extends KiwiNamedItem {
	
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}
	
	public getDescription(): string {
		return this.serialized['description'] as string;
	}
	
	public getClassificationId(): number {
		return this.serialized['classification'] as number;
	}
	
	public async getClassification(): Promise<Classification> {
		return await Classification.getById(this.getClassificationId());
	}
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<Product> {
		return await super.getByName(name) as Product;
	}
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<Product>> {
		return await super.serverFilter(filterObj) as Array<Product>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Product>> {
		return await super.getByIds(id) as Array<Product>;
	}
	
	public static async getById(
		id: number
	): Promise<Product> {
		return await super.getById(id) as Product;
	}
}