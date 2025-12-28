import KiwiBaseItem from '../core/kiwiBaseItem';
import Product from './product';

export default class Version extends KiwiBaseItem {
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getValue(): string {
		return this.serialized.value as string;
	}

	public getProductId(): number {
		return this.serialized.product as number;
	}

	public getProductName(): string {
		return this.serialized['product__name'] as string;
	}

	public async getProduct(): Promise<Product> {
		return await Product.getById(this.getProductId());
	}

	// Inherited methods
	// ------------------------------------------------------------------------

	// Kiwi Base
	// --------------------------------

	public static async serverFilter(
		filterObj: Record<string, unknown>,
	): Promise<Array<Version>> {
		return await super.serverFilter(filterObj) as Array<Version>;
	}

	public static async getByIds(
		id: number | Array<number>,
	): Promise<Array<Version>> {
		return await super.getByIds(id) as Array<Version>;
	}

	public static async getById(
		id: number,
	): Promise<Version> {
		return await super.getById(id) as Version;
	}
}
