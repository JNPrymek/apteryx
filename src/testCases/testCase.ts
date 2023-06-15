import KiwiBaseItem from '../core/kiwiBaseItem';
import TimeUtils from '../utils/timeUtils';

import Priority from '../management/priority';
import Category from './category';
import TestCaseStatus from './testCaseStatus';
import User from '../management/user';
import { 
	TestCaseCreateResponseValues,
	TestCaseCreateValues,
	TestCaseValues,
	TestCaseWriteValues
} from './testCase.type';
import KiwiConnector from '../core/kiwiConnector';
import Component from '../management/component';
import Tag from '../management/tag';

export default class TestCase extends KiwiBaseItem {
	
	// Constructor for all classes
	constructor(serializedValues: TestCaseValues) {
		super(serializedValues);
	}
	
	public getCreateDate(): Date {
		return TimeUtils
			.serverStringToDate(this.serialized['create_date'] as string);
	}
	
	public isAutomated(): boolean {
		return this.serialized['is_automated'] as boolean;
	}

	public isManual(): boolean {
		return !this.isAutomated();
	}

	public async setAutomation(isAutomated: boolean) : Promise<void> {
		await this.serverUpdate({ is_automated: isAutomated });
	}

	public async setIsAutomated(): Promise<void> {
		await this.setAutomation(true);
	}

	public async setIsManual(): Promise<void> {
		await this.setAutomation(false);
	}
	
	public getScript(): string {
		return this.serialized['script'] as string;
	}

	public async setScript(script?: string): Promise<void> {
		const newScriptVal = script ?? '';
		await this.serverUpdate({ script: newScriptVal });
	}
	
	public getArguments(): string {
		return this.serialized['arguments'] as string;
	}

	public async setArguments(args?: string): Promise<void> {
		const newArgs = args ?? '';
		await this.serverUpdate({ arguments: newArgs });
	}
	
	public getRequirements(): string {
		return this.serialized['requirement'] as string;
	}

	public async setRequirements(requirements?: string): Promise<void> {
		const newReqs = requirements ?? '';
		await this.serverUpdate({ requirement: newReqs });
	}
	
	public getExtraLink(): string {
		return this.serialized['extra_link'] as string;
	}

	public async setExtraLink(extraLink?: string): Promise<void> {
		const newLink = extraLink ?? '';
		await this.serverUpdate({ extra_link: newLink });
	}

	public getReferenceLink(): string {
		return this.getExtraLink();
	}

	public async setReferenceLink(referenceLink?: string): Promise<void> {
		await this.setExtraLink(referenceLink);
	}
	
	public getSummary(): string {
		return this.serialized['summary'] as string;
	}

	public async setSummary(summary: string): Promise<void> {
		await this.serverUpdate({ summary: summary });
	}

	public getTitle(): string {
		return this.getSummary();
	}

	public async setTitle(title: string): Promise<void> {
		await this.setSummary(title);
	}
	
	public getText(): string {
		return this.serialized['text'] as string;
	}

	public async setText(text?: string): Promise<void> {
		const newText = text ?? '';
		await this.serverUpdate({ text: newText });
	}

	public getDescription(): string {
		return this.getText();
	}

	public async setDescription(text?: string): Promise<void> {
		await this.setText(text);
	}
	
	public getNotes(): string {
		return this.serialized['notes'] as string;
	}

	public async setNotes(notes?: string): Promise<void> {
		const newNotes = notes ?? '';
		await this.serverUpdate({ notes: newNotes });
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

	public async setCaseStatus(
		status: number | string | TestCaseStatus
	): Promise<void> {
		const statusId = await TestCaseStatus.resolveStatusId(status);
		await this.serverUpdate({ case_status: statusId });
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

	public async setCategory(
		category: number | string | Category
	): Promise<void> {
		const categoryId = await Category.resolveCategoryId(category);
		await this.serverUpdate({ category: categoryId });
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

	public async setPriority(
		priority: number | string | Priority
	): Promise<void> {
		let priorityId = (typeof priority === 'number') ? priority : 0;
		if (priority instanceof Priority) {
			priorityId = priority.getId();
		}
		if (typeof priority === 'string') {
			const priorityObj = await Priority.getByValue(priority);
			priorityId = priorityObj.getId();
		}
		await this.serverUpdate({ priority: priorityId });
	}

	public getSetupDuration(): number {
		return this.serialized['setup_duration'] as number;
	}

	public async setSetupDuration(time?: number): Promise<void> {
		const newTime = time ?? 0;
		await this.serverUpdate({ setup_duration: newTime });
	}

	public getTestingDuration(): number {
		return this.serialized['testing_duration'] as number;
	}

	public async setTestingDuration(time?: number): Promise<void> {
		const newTime = time ?? 0;
		await this.serverUpdate({ testing_duration: newTime });
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
	
	public async getAuthor(): Promise<User> {
		return await User.getById(this.getAuthorId());
	}

	public async setAuthor(author: number | string | User): Promise<void> {
		const authorId = await User.resolveUserId(author);
		await this.serverUpdate({ author: authorId });
	};
	
	public getReviewerId(): number {
		return this.serialized['reviewer'] as number;
	}
	
	public getReviewerName(): string {
		return this.serialized['reviewer__username'] as string;
	}
	
	public async getReviewer(): Promise<User> {
		return await User.getById(this.getReviewerId());
	}

	public async setReviewer(
		reviewer?: number | string | User | null
	): Promise<void> {
		if (reviewer) {
			const reviewerId = await User.resolveUserId(reviewer);
			await this.serverUpdate({ reviewer: reviewerId });
		} else {
			await this.serverUpdate({ reviewer: null });
		}
	};
	
	public getDefaultTesterId(): number {
		return this.serialized['default_tester'] as number;
	}
	
	public getDefaultTesterName(): string {
		return this.serialized['default_tester__username'] as string;
	}
	
	public async getDefaultTester(): Promise<User> {
		return await User.getById(this.getDefaultTesterId());
	}

	public async setDefaultTester(
		tester?: number | string | User | null
	): Promise<void> {
		if (tester) {
			const testerId = await User.resolveUserId(tester);
			await this.serverUpdate({ default_tester: testerId });
		} else {
			await this.serverUpdate({ default_tester: null });
		}
	};

	public async addComponent(
		component: number | string | Component
	): Promise<void> {
		let componentName = (typeof component === 'string') ? component : '';
		if (component instanceof Component) {
			componentName = component.getName();
		}
		if (typeof component === 'number') {
			const comp = await Component.getById(component);
			componentName = comp.getName();
		}

		await KiwiConnector.sendRPCMethod('TestCase.add_component', [
			this.getId(),
			componentName
		]);
	}

	public async removeComponent(component: number | Component): Promise<void> {
		const componentId = 
			(component instanceof Component) ? component.getId() : component;
		await KiwiConnector.sendRPCMethod('TestCase.remove_component', [
			this.getId(),
			componentId
		]);
	}

	public async addTag(tag: number | string | Tag): Promise<void> {
		let tagName = (typeof tag === 'string') ? tag : '';
		if (tag instanceof Tag) {
			tagName = tag.getName();
		}
		if (typeof tag === 'number') {
			const tagObj = await Tag.getById(tag);
			tagName = tagObj.getName();
		}
		await KiwiConnector.sendRPCMethod('TestCase.add_tag', [
			this.getId(),
			tagName
		]);
	}

	public async removeTag(tag: number | string | Tag): Promise<void> {
		let tagName = (typeof tag === 'string') ? tag : '';
		if (tag instanceof Tag) {
			tagName = tag.getName();
		}
		if (typeof tag === 'number') {
			const tagObj = await Tag.getById(tag);
			tagName = tagObj.getName();
		}
		await KiwiConnector.sendRPCMethod('TestCase.remove_tag', [
			this.getId(),
			tagName
		]);
	}

	public async getTags(): Promise<Array<Tag>> {
		return await Tag.getTagsForTestCase(this.getId());
	}
	
	public static async create(
		testCaseValues: TestCaseCreateValues
	): Promise<TestCase> {
		const respose = await KiwiConnector.sendRPCMethod(
			'TestCase.create', 
			[ testCaseValues ]
		);
		const id = (respose as TestCaseCreateResponseValues).id;
		return await TestCase.getById(id);
	}

	public async serverUpdate(
		updateValues: Partial<TestCaseWriteValues>
	): Promise<void> {
		await KiwiConnector.sendRPCMethod('TestCase.update', [
			this.getId(),
			updateValues
		]);
		await this.syncServerValues();
	}
	
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