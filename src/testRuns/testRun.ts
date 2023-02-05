import KiwiBaseItem from '../core/kiwiBaseItem';
import Product from '../management/product';
import TestPlan from '../testPlans/testPlan';
import TimeUtils from '../utils/timeUtils';

export default class TestRun extends KiwiBaseItem {
	
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getSummary(): string {
		return this.serialized['summary'] as string;
	}

	public getName(): string {
		return this.getSummary();
	}

	public getTitle(): string {
		return this.getSummary();
	}

	public getNotes(): string {
		return this.serialized['notes'] as string;
	}

	public getDescription(): string {
		return this.getNotes();
	}

	public getPlanId(): number {
		return this.serialized['plan'] as number;
	}

	public getPlanName(): string {
		return this.serialized['plan__name'] as string;
	}

	public async getPlan(): Promise<TestPlan> {
		return await TestPlan.getById(this.getPlanId());
	}

	public getProductVersionId(): number {
		return this.serialized['plan__product_version'] as number;
	}

	public getProductVersionValue(): string {
		return this.serialized['plan__product_version__value'] as string;
	}

	public getProductVersionName(): string {
		return this.getProductVersionValue();
	}

	public getProductId(): number {
		return this.serialized['plan__product'] as number;
	}

	public async getProduct(): Promise<Product> {
		return await Product.getById(this.getProductId());
	}

	public getPlannedStartDate(): Date | null {
		const rawString = this.serialized['planned_start'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public getPlannedStopDate(): Date | null {
		const rawString = this.serialized['planned_stop'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public getStartDate(): Date | null {
		const rawString = this.serialized['start_date'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public getStopDate(): Date | null {
		const rawString = this.serialized['stop_date'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public getActualStartDate(): Date | null {
		return this.getStartDate();
	}

	public getActualStopDate(): Date | null {
		return this.getStopDate();
	}

	public getManagerId(): number {
		return this.serialized['manager'] as number;
	}

	public getManagerUsername(): string {
		return this.serialized['manager__username'] as string;
	}

	// TODO - implement getManager

	public getDefaultTesterId(): number {
		return this.serialized['default_tester'] as number;
	}

	public getDefaultTesterUsername(): string {
		return this.serialized['default_tester__username'] as string;
	}

	// TODO - implement getDefaultTester

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<TestRun>> {
		return await super.serverFilter(filterObj) as Array<TestRun>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<TestRun>> {
		return await super.getByIds(id) as Array<TestRun>;
	}
	
	public static async getById(
		id: number
	): Promise<TestRun> {
		return await super.getById(id) as TestRun;
	}
	
}