import KiwiBaseItem from '../core/kiwiBaseItem';
import TimeUtils from '../utils/timeUtils';

import Priority from '../management/priority';
import Category from './category';
import TestCaseStatus from './testCaseStatus';

export default class TestCase extends KiwiBaseItem {
	
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}
	
	public getCreateDate(): Date {
		return TimeUtils.serverStringToDate(this.serialized['create_date'] as string);
	}
	
	public isAutomated(): boolean {
		return this.serialized['is_automated'] as boolean;
	}
	public isManual(): boolean {
		return !this.isAutomated();
	}
	
	public getScript(): string {
		return this.serialized['script'] as string;
	}
	
	public getArguments(): string {
		return this.serialized['arguments'] as string;
	}
	
	public getRequirements(): string {
		return this.serialized['requirement'] as string;
	}
	
	public getExtraLink(): string {
		return this.serialized['extra_link'] as string;
	}
	public getReferenceLink(): string {
		return this.getExtraLink();
	}
	
	public getSummary(): string {
		return this.serialized['summary'] as string;
	}
	public getTitle(): string {
		return this.getSummary();
	}
	
	public getText(): string {
		return this.serialized['text'] as string;
	}
	
	public getNotes(): string {
		return this.serialized['notes'] as string;
	}
	
	public getCaseStatusId(): number {
		return this.serialized['case_status'] as number;
	}
	
	public getCaseStatusName(): string {
		return this.serialized['case_status__name'] as string;
	}
	
	public async getCaseStatus(): Promise<TestCaseStatus> {
		return await TestCaseStatus.getById(this.getCaseStatusId());
	}
	
	public getCategoryId(): number {
		return this.serialized['category'] as number;
	}
	
	public getCategoryName(): string {
		return this.serialized['category__name'] as string;
	}
	
	public async getCategory(): Promise<Category> {
		return await Category.getById(this.getCategoryId());
	}
	
	public getPriorityId(): number {
		return this.serialized['priority'] as number;
	}
	
	public getPriorityValue(): string {
		return this.serialized['priority__value'] as string;
	}
	
	public async getPriority(): Promise<Priority> {
		return await Priority.getById(this.getPriorityId());
	}

	public getSetupDuration(): number {
		return this.serialized['setup_duration'] as number;
	}

	public getTestingDuration(): number {
		return this.serialized['testing_duration'] as number;
	}

	public getTotalDuration(): number {
		// Included in raw values
		return this.serialized['expected_duration'] as number;
	}
	
	public getAuthorId(): number {
		return this.serialized['author'] as number;
	}
	
	public getAuthorName(): string {
		return this.serialized['author__username'] as string;
	}
	
	// public async getAuthor(): Promise<User> {
	// 	return await User.getById(this.getAuthorId());
	// }
	
	public getReviewerId(): number {
		return this.serialized['reviewer'] as number;
	}
	
	public getReviewerName(): string {
		return this.serialized['reviewer__username'] as string;
	}
	
	// public async getReviewer(): Promise<User> {
	// 	return await User.getById(this.getReviewerId());
	// }
	
	public getDefaultTesterId(): number {
		return this.serialized['default_tester'] as number;
	}
	
	public getDefaultTesterName(): string {
		return this.serialized['default_tester__username'] as string;
	}
	
	// public async getDefaultTester(): Promise<User> {
	// 	return await User.getById(this.getDefaultTesterId());
	// }
	
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<TestCase>> {
		return await super.serverFilter(filterObj) as Array<TestCase>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<TestCase>> {
		return await super.getByIds(id) as Array<TestCase>;
	}
	
	public static async getById(
		id: number
	): Promise<TestCase> {
		return await super.getById(id) as TestCase;
	}
	
	// ------------------------------------------------------------------------
}