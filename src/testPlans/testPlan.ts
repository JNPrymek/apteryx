import KiwiConnector from '../core/kiwiConnector';
import KiwiNamedItem from '../core/kiwiNamedItem';
import Product from '../management/product';
import Version from '../management/version';
import TimeUtils from '../utils/timeUtils';
import PlanType from './planType';
import TestCase from '../testCases/testCase';
import { 
	TestPlanCreateResponse,
	TestPlanCreateValues,
	TestPlanWriteValues
} from './testPlan.type';

export default class TestPlan extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getText(): string {
		return this.serialized['text'] as string;
	}

	public async setText(text= ''): Promise<void> {
		await this.serverUpdate({ text: text });
	}

	public getCreateDate(): Date {
		return TimeUtils
			.serverStringToDate(this.serialized['create_date'] as string);
	}

	public async setCreateDate(createDate: string | Date): Promise<void> {
		const dateString = (createDate instanceof Date) ? 
			TimeUtils.dateToServerString(createDate) : createDate;
		await this.serverUpdate({ create_date: dateString });
	}

	public isActive(): boolean {
		return this.serialized['is_active'] as boolean;
	}

	public isDisabled(): boolean {
		return !this.isActive();
	}
	
	public async setIsActive(active: boolean): Promise<void> {
		await this.serverUpdate({ is_active: active });
	}
	
	public async setActive(): Promise<void> {
		return this.setIsActive(true);
	}
	
	public async setDisabled(): Promise<void> {
		return this.setIsActive(false);
	}

	public getExtraLink(): string {
		return this.serialized['extra_link'] as string;
	}
	
	public async setExtraLink(link?: string): Promise<void> {
		const newLink = link ?? '';
		await this.serverUpdate({ extra_link: newLink });
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
	
	public async setProductVersion(version: Version | number): Promise<void> {
		const versionId = (version instanceof Version) 
			? version.getId() : version;
		await this.serverUpdate({ product_version: versionId });
	}

	public getProductId(): number {
		return this.serialized['product'] as number;
	}

	public async getProduct(): Promise<Product> {
		return await Product.getById(this.getProductId());
	}
	
	public async setProduct(product: number | Product): Promise<void> {
		const productId = (product instanceof Product)
			? product.getId() : product;
		await this.serverUpdate({ product: productId });
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
	
	public async setType(type: number | string | PlanType): Promise<void> {
		let typeId = (type instanceof PlanType) ? type.getId() : 0;
		if (typeof type === 'number') {
			typeId = type;
		}
		if (typeof type === 'string') {
			const typeObj = await PlanType.getByName(type);
			typeId = typeObj.getId();
		}
		await this.serverUpdate({ type: typeId });
	}

	public getParentId(): number {
		return this.serialized['parent'] as number;
	}

	public async getParent(): Promise<TestPlan|null> {
		const parentId = this.getParentId();
		return (parentId == null ? null : await TestPlan.getById(parentId));
	}
	
	public async setParent(newParent?: TestPlan | number): Promise<void> {
		let parentId: number | null = null;
		if (newParent) {
			parentId = (newParent instanceof TestPlan) ?
				newParent.getId() : newParent;
		}
		await this.serverUpdate({ parent: parentId });
	}

	public async getTestCases(
		sortOrder: 'TESTCASE_ID' | 'SORTKEY' = 'SORTKEY'
	): Promise<Array<TestCase>> {
		if (sortOrder === 'TESTCASE_ID') {
			return (await TestCase.serverFilter({ 'plan': this.getId() }));
		}

		const sortKeys = await KiwiConnector.sendRPCMethod(
			'TestCase.sortkeys', 
			[{ plan: this.getId() }]
		) as Record<string, unknown>;

		/*
			example result: { "1": 10, "2": 20 ... }
		*/
		const tcIds = Object.keys(sortKeys).map(
			strKey => { return parseInt(strKey); }
		);

		const testCases = await TestCase.getByIds(tcIds);
		testCases.sort( (a, b) => {
			const aSortKey = sortKeys[a.getId()] as number;
			const bSortKey = sortKeys[b.getId()] as number;
			return (aSortKey - bSortKey);
			
		});

		return testCases;
	}

	public async addSingleTestCase(testCase: number | TestCase): Promise<void> {
		const tcId = TestCase.resolveTestCaseId(testCase);
		await KiwiConnector.sendRPCMethod(
			'TestPlan.add_case',
			[this.getId(), tcId]
		);
	}

	public async removeSingleTestCase(
		testCase: number | TestCase
	): Promise<void> {
		const tcId = TestCase.resolveTestCaseId(testCase);
		await KiwiConnector.sendRPCMethod(
			'TestPlan.remove_case',
			[this.getId(), tcId]
		);
	}

	/**
	 * Sets the SortKey value for a specific TestCase-TestPlan pair.  
	 * Does NOT handle TestCases with duplicate SortKeys
	 * @param testCase TestCase object or numeric ID
	 * @param sortKey Numeric key used for sorting TestCases (ASC order)
	 */
	public async setSpecificTestCaseSortOrder(
		testCase: number | TestCase,
		sortKey: number
	): Promise<void> {
		const caseId = TestCase.resolveTestCaseId(testCase);
		await KiwiConnector.sendRPCMethod(
			'TestPlan.update_case_order',
			[this.getId(), caseId, sortKey]
		);
	}

	/**
	 * Sorts the TestCases within the TestPlan to match the given array.  
	 * Does NOT verify that specified TestCases are added to the TestPlan.  
	 * Assigns normailized sortKey values.
	 * @param testCases pre-sorted list of TestCase objects or numeric IDs
	 */
	public async setAllTestCaseSortOrder(
		testCases: Array<TestCase | number>
	): Promise<void> {
		for (let i = 0; i < testCases.length; i++) {
			await this.setSpecificTestCaseSortOrder(testCases[i], (i * 10));
		}
	}

	/**
	 * Normalizes TestCase SortKeys to the default 0, 10, 20... values.  
	 * Current sort order is preserved.
	 */
	public async normalizeSortKeys(): Promise<void> {
		// Example result: { "1": 10, "2": 20 ... }
		const sortKeys = await KiwiConnector.sendRPCMethod(
			'TestCase.sortkeys', 
			[{ plan: this.getId() }]
		) as Record<string, number>;

		type SortMapping = {
			tcId: number;
			sortKey: number;
		}
		const sortMappings: Array<SortMapping> = [];
		for (const [idStr, sortKey] of Object.entries(sortKeys)) {
			sortMappings.push({
				tcId: parseInt(idStr),
				sortKey
			});
		}
		// Ascending order by sortKey, then by tcId
		sortMappings.sort((a, b) => {
			if (a.sortKey == b.sortKey) return a.tcId - b.tcId;
			return a.sortKey - b.sortKey;
		});
		
		for (let i = 0; i< sortMappings.length; i++ ) {
			const item = sortMappings[i];
			await this.setSpecificTestCaseSortOrder(item.tcId, (i * 10));
		}
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

	public static async create(
		values: TestPlanCreateValues
	): Promise<TestPlan> {
		const response = (await KiwiConnector
			.sendRPCMethod('TestPlan.create', [values])
		) as TestPlanCreateResponse;
		const plan = await this.getById(response.id);
		return plan;
	}

	public async serverUpdate(
		updateValues: Partial<TestPlanWriteValues>
	): Promise<void> {
		await KiwiConnector.sendRPCMethod('TestPlan.update', [
			this.getId(),
			updateValues
		]);
		await this.syncServerValues();
	}

	public async setName(newName: string): Promise<void> {
		await this.serverUpdate({ name: newName });
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
