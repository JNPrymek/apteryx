import KiwiBaseItem from '../core/kiwiBaseItem';
import Build from '../management/build';
import TestCase from '../testCases/testCase';
import TimeUtils from '../utils/timeUtils';

export default class TestExecution extends KiwiBaseItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getAssigneeId(): number {
		return this.serialized['assignee'] as number;
	}
	
	public getAssigneeUsername(): string {
		return this.serialized['assignee__username'] as string;
	}

	public getLastTesterId(): number {
		return this.serialized['tested_by'] as number;
	}

	public getLastTesterName(): string {
		return this.serialized['tested_by__username'] as string;
	}

	public getTestCaseVersion(): number {
		return this.serialized['case_text_version'] as number;
	}

	public getStartDate(): Date {
		const rawString = this.serialized['start_date'] as string;
		return TimeUtils.serverStringToDate(rawString);
	}

	public getStopDate(): Date {
		const rawString = this.serialized['stop_date'] as string;
		return TimeUtils.serverStringToDate(rawString);
	}

	public getSortKey(): number {
		return this.serialized['sortkey'] as number;
	}

	public getTestRunId(): number {
		return this.serialized['run'] as number;
	}

	// TODO public getTestRun(): TestRun

	public getTestCaseId(): number {
		return this.serialized['case'] as number;
	}

	public async getTestCase(): Promise<TestCase> {
		return await TestCase.getById(this.getTestCaseId());
	}

	public getSummary(): string {
		return this.serialized['case__summary'] as string;
	}

	public getTestCaseSummary(): string {
		return this.getSummary();
	}

	public getBuildId(): number {
		return this.serialized['build'] as number;
	}

	public getBuildName(): string {
		return this.serialized['build__name'] as string;
	}

	public async getBuild(): Promise<Build> {
		return await Build.getById(this.getBuildId());
	}

	public getStatusId(): number {
		return this.serialized['status'] as number;
	}

	public getStatusName(): string {
		return this.serialized['status__name'] as string;
	}

	// TODO public async getStatus(): TestExecutionStatus

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<TestExecution>> {
		return await super.serverFilter(filterObj) as Array<TestExecution>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<TestExecution>> {
		return await super.getByIds(id) as Array<TestExecution>;
	}
	
	public static async getById(
		id: number
	): Promise<TestExecution> {
		return await super.getById(id) as TestExecution;
	}
	
	// ------------------------------------------------------------------------
}