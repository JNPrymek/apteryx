
import KiwiNamedItem from '../core/kiwiNamedItem';
import Product from '../management/product';
import TimeUtils from '../utils/timeUtils';
import PlanType from './planType';

export default class TestPlan extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getText(): string {
		return this.serialized['text'] as string;
	}

	public getCreateDate(): Date {
		return TimeUtils.serverStringToDate(this.serialized['create_date'] as string);
	}

	public isActive(): boolean {
		return this.serialized['is_active'] as boolean;
	}

	public isDisabled(): boolean {
		return !this.isActive();
	}

	public getExtraLink(): string {
		return this.serialized['extra_link'] as string;
	}

	public getProductVersionId(): number {
		return this.serialized['product_version'] as number;
	}

	public getProductId(): number {
		return this.serialized['product'] as number;
	}

	public async getProduct(): Promise<Product> {
		return await Product.getById(this.getProductId());
	}

	public getProductName(): string {
		return this.serialized['product__name'] as string;
	}

	public getTypeId(): number {
		return this.serialized['type'] as number;
	}

	public getTypeName(): string {
		return this.serialized['type__name'] as string;
	}

	public async getType(): Promise<PlanType> {
		return await PlanType.getById(this.getTypeId());
	}

	public getParentId(): number {
		return this.serialized['parent'] as number;
	}

	public async getParent(): Promise<TestPlan> {
		return await TestPlan.getById(this.getParentId());
	}



	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<TestPlan> {
		return await super.getByName(name) as TestPlan;
	}
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<TestPlan>> {
		return await super.serverFilter(filterObj) as Array<TestPlan>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<TestPlan>> {
		return await super.getByIds(id) as Array<TestPlan>;
	}
	
	public static async getById(
		id: number
	): Promise<TestPlan> {
		return await super.getById(id) as TestPlan;
	}
	
	// ------------------------------------------------------------------------
}
