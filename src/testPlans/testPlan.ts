import KiwiConnector from '../core/kiwiConnector';
import KiwiNamedItem from '../core/kiwiNamedItem';
import Product from '../management/product';
import Version from '../management/version';
import TimeUtils from '../utils/timeUtils';
import PlanType from './planType';
import TestCase from '../testCases/testCase';

export default class TestPlan extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getText(): string {
		return this.serialized['text'] as string;
	}

	public getCreateDate(): Date {
		return TimeUtils
			.serverStringToDate(this.serialized['create_date'] as string);
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

	public getProductVersionValue(): string {
		return this.serialized['product_version__value'] as string;
	}

	public async getProductVersion(): Promise<Version> {
		return await Version.getById(this.getProductVersionId());
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

	public async getParent(): Promise<TestPlan|null> {
		const parentId = this.getParentId();
		return (parentId == null ? null : await TestPlan.getById(parentId));
	}

	public async getTestCases(
		sortOrder: 'TESTCASE_ID' | 'SORTKEY' = 'SORTKEY'
	): Promise<Array<TestCase>> {
		if (sortOrder === 'TESTCASE_ID') {
			return (await TestCase.serverFilter({ 'plan': this.getId() }));
		}

		const rawResponse = await KiwiConnector.sendRPCMethod(
			'TestCase.sortkeys', 
			[{ plan: this.getId() }]
		) as Record<string, unknown>;

		/*
			example result: { "1": 10, "2": 20 ... }
		*/
		const tcIds = Object.keys(rawResponse).map(
			strKey => { return parseInt(strKey); }
		);

		const testCases = await TestCase.getByIds(tcIds);
		testCases.sort( (a, b) => {
			const aSortKey = rawResponse[a.getId()] as number;
			const bSortKey = rawResponse[b.getId()] as number;
			return (aSortKey - bSortKey);
			
		});

		return testCases;
	}

	public static async getPlansWithTestCase(
		test: TestCase | number
	): Promise<Array<TestPlan>> {
		const testCaseId: number = 
			(test instanceof TestCase) ? test.getId() : test;
		return (await TestPlan.serverFilter({ case: testCaseId }));
		
	}

	public async getDirectChildren(): Promise<Array<TestPlan>> {
		return await TestPlan.serverFilter({ parent: this.getId() });
	}
	
	public async hasChildren(): Promise<boolean> {
		return  ((await this.getDirectChildren()).length > 0);
	}

	public async getChildren(direct = false): Promise<Array<TestPlan>> {
		if (direct) {
			return await this.getDirectChildren();
		}

		let results: Array<TestPlan> = [];
		const directChildren = await this.getDirectChildren();
		for (const child of directChildren) {
			results.push(child);
			const grandChildren = await child.getChildren();
			results = results.concat(grandChildren);
		}
		return results;
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
