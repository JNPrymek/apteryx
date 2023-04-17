import KiwiNamedItem from '../core/kiwiNamedItem';
import Product from '../management/product';

export default class Category extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}
	
	public getProductId(): number {
		return this.serialized.product as number;
	}

	public getDescription(): string {
		return this.serialized.description as string;
	}
	
	public async getProduct(): Promise<Product> {
		return await Product.getById(this.getProductId());
	}

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<Category> {
		return await super.getByName(name) as Category;
	}
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<Category>> {
		return await super.serverFilter(filterObj) as Array<Category>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Category>> {
		return await super.getByIds(id) as Array<Category>;
	}
	
	public static async getById(
		id: number
	): Promise<Category> {
		return await super.getById(id) as Category;
	}
	
	// ------------------------------------------------------------------------
}
