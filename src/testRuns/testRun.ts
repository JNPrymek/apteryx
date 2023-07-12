import KiwiBaseItem from '../core/kiwiBaseItem';
import KiwiConnector from '../core/kiwiConnector';
import Product from '../management/product';
import User from '../management/user';
import TestCase from '../testCases/testCase';
import TestPlan from '../testPlans/testPlan';
import TimeUtils from '../utils/timeUtils';
import {
	TestRunCaseEntry,
	TestRunCreateValues,
	TestRunUpdateResponse,
	TestRunWriteValues
} from './testRun.type';

export default class TestRun extends KiwiBaseItem {
	
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getSummary(): string {
		return this.serialized['summary'] as string;
	}

	public async setSummary(summary: string): Promise<void> {
		await this.serverUpdate({ summary: summary });
	}

	public getName(): string {
		return this.getSummary();
	}

	public async setName(name: string): Promise<void> {
		return this.setSummary(name);
	}

	public getTitle(): string {
		return this.getSummary();
	}

	public async setTitle(title: string): Promise<void> {
		return this.setSummary(title);
	}

	public getNotes(): string {
		return this.serialized['notes'] as string;
	}

	public async setNotes(notes?: string): Promise<void> {
		const newNotes = notes ?? '';
		await this.serverUpdate({ notes: newNotes });
	}

	public getDescription(): string {
		return this.getNotes();
	}

	public async setDescription(description?: string): Promise<void> {
		return this.setNotes(description);
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

	public async setPlannedStartDate(date?: Date): Promise<void> {
		const dateString = date ? TimeUtils.dateToServerString(date) : '';
		await this.serverUpdate({ planned_start: dateString });
	}

	public getPlannedStopDate(): Date | null {
		const rawString = this.serialized['planned_stop'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public async setPlannedStopDate(date?: Date): Promise<void> {
		const dateString = date ? TimeUtils.dateToServerString(date) : '';
		await this.serverUpdate({ planned_stop: dateString });
	}

	public getStartDate(): Date | null {
		const rawString = this.serialized['start_date'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public async setStartDate(date?: Date): Promise<void> {
		const dateString = date ? TimeUtils.dateToServerString(date) : '';
		await this.serverUpdate({ start_date: dateString });
	}

	public getStopDate(): Date | null {
		const rawString = this.serialized['stop_date'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public async setStopDate(date?: Date): Promise<void> {
		const dateString = date ? TimeUtils.dateToServerString(date) : '';
		await this.serverUpdate({ stop_date: dateString });
	}

	public getActualStartDate(): Date | null {
		return this.getStartDate();
	}

	public async setActualStartDate(date?: Date): Promise<void> {
		return this.setStartDate(date);
	}

	public getActualStopDate(): Date | null {
		return this.getStopDate();
	}

	public async setActualStopDate(date?: Date): Promise<void> {
		return this.setStopDate(date);
	}

	public getManagerId(): number {
		return this.serialized['manager'] as number;
	}

	public getManagerUsername(): string {
		return this.serialized['manager__username'] as string;
	}

	public async getManager(): Promise<User> {
		return User.getById(this.getManagerId());
	}

	public async setManager(manager: User | number): Promise<void> {
		const managerId = await User.resolveUserId(manager);
		await this.serverUpdate({ manager: managerId });
	}

	public getDefaultTesterId(): number {
		return this.serialized['default_tester'] as number;
	}

	public getDefaultTesterUsername(): string {
		return this.serialized['default_tester__username'] as string;
	}

	public async getDefaultTester(): Promise<User | null> {
		const testerId = this.getDefaultTesterId();
		return (testerId === null) ? null : User.getById(testerId);
	}

	public async setDefaultTester(tester: User | number): Promise<void> {
		const testerId = await User.resolveUserId(tester);
		await this.serverUpdate({ default_tester: testerId });
	}

	public async getTestCases(): Promise<Array<TestCase>> {
		const rawCaseList = (await KiwiConnector.sendRPCMethod(
			'TestRun.get_cases', 
			[ this.getId() ]
		)) as Array<TestRunCaseEntry>;
		const caseIdList: Array<number> = [];
		rawCaseList.forEach( value => { caseIdList.push(value.id); });
		return TestCase.getByIds(caseIdList);
	}

	public static async create(values: TestRunCreateValues): Promise<TestRun> {
		const response = (await KiwiConnector.sendRPCMethod(
			'TestRun.create',
			[values]
		)) as TestRunUpdateResponse;
		return TestRun.getById(response.id);
	}

	public async serverUpdate(
		updateVal: Partial<TestRunWriteValues>
	): Promise<void> {
		await KiwiConnector.sendRPCMethod(
			'TestRun.update',
			[
				this.getId(),
				updateVal
			]
		);
		await this.syncServerValues();
	}

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
