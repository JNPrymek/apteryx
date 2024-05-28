import KiwiBaseItem from '../core/kiwiBaseItem';
import KiwiConnector from '../core/kiwiConnector';
import Build from '../management/build';
import User from '../management/user';
import TestCase from '../testCases/testCase';
import TimeUtils from '../utils/timeUtils';
import {
	TestExecutionValues,
	TestExecutionWriteValues
} from './testExecution.type';
import TestExecutionStatus from './testExecutionStatus';
import TestRun from './testRun';
import { CommentValues } from '../comments/comment.type';
import Comment from '../comments/comment';

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

	public async getAssignee(): Promise<User | null> {
		const assigneeId = this.getAssigneeId();
		return (assigneeId === null) ? null : User.getById(assigneeId);
	}

	public async setAssignee(assignee?: User | number): Promise<void> {
		const assigneeId = assignee ?
			(await User.resolveUserId(assignee)) :
			null;
		await this.serverUpdate({ assignee: assigneeId });
	}

	public getLastTesterId(): number {
		return this.serialized['tested_by'] as number;
	}

	public getLastTesterName(): string {
		return this.serialized['tested_by__username'] as string;
	}

	public async getLastTester(): Promise<User | null> {
		const lastTesterId = this.getLastTesterId();
		return (lastTesterId === null) ? null : User.getById(lastTesterId);
	}

	public async setLastTester(tester?: User | number | null): Promise<void> {
		const userId = (tester) ? (await User.resolveUserId(tester)) : null;
		await this.serverUpdate({ tested_by: userId });
	}

	public getTestCaseVersion(): number {
		return this.serialized['case_text_version'] as number;
	}

	public getStartDate(): Date | null {
		const rawString = this.serialized['start_date'] as string;
		if (rawString) {
			return TimeUtils.serverStringToDate(rawString);
		} else {
			return null;
		}
	}

	public async setStartDate(date?: Date | null): Promise<void> {
		const dateString = date ? TimeUtils.dateToServerString(date) : null;
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

	public async setStopDate(date?: Date | null): Promise<void> {
		const dateString = date ? TimeUtils.dateToServerString(date) : null;
		await this.serverUpdate({ stop_date: dateString });
	}

	public getExpectedDuration(): number {
		return this.serialized['expected_duration'] as number;
	}

	public getActualDuration(): number | null {
		return this.serialized['actual_duration'] as number | null;
	}

	public getSortKey(): number {
		return this.serialized['sortkey'] as number;
	}

	public async setSortKey(sortkey: number): Promise<void> {
		await this.serverUpdate({ sortkey: sortkey });
	}

	public getTestRunId(): number {
		return this.serialized['run'] as number;
	}

	public async getTestRun(): Promise<TestRun> {
		return await TestRun.getById(this.getTestRunId());
	}

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

	public async getStatus(): Promise<TestExecutionStatus> {
		return await TestExecutionStatus.getById(this.getStatusId());
	}

	public async setStatus(
		status: TestExecutionStatus | number | string
	): Promise<void> {
		const statusId = await TestExecutionStatus.resolveId(status);
		await this.serverUpdate({ status: statusId });
	}

	public async getComments(): Promise<Array<Comment>> {
		const rawResults: Array<CommentValues> = 
			await KiwiConnector.sendRPCMethod(
				'TestExecution.get_comments',
				[this.getId()]
			) as Array<CommentValues>;
		return rawResults.map( val => new Comment(val));
	}

	public async addComment(commentText: string): Promise<Comment> {
		const result = await KiwiConnector.sendRPCMethod(
			'TestExecution.add_comment',
			[ this.getId(), commentText ]
		) as CommentValues;
		return new Comment(result);
	}

	public async removeComment(comment: Comment | number): Promise<void> {
		const commentId: number = (comment instanceof Comment)
			? comment.getId()
			: comment;
		await KiwiConnector.sendRPCMethod(
			'TestExecution.remove_comment',
			[this.getId(), commentId]
		);
	}

	public async removeAllComments(): Promise<void> {
		await KiwiConnector.sendRPCMethod(
			'TestExecution.remove_comment',
			[this.getId(), null]
		);
	}

	public async serverUpdate(
		updateValues: Partial<TestExecutionWriteValues>
	): Promise<void> {
		const result = await KiwiConnector.sendRPCMethod(
			'TestExecution.update', [
				this.getId(),
				updateValues
			]);
		this.serialized = result as TestExecutionValues;
	}

	public async delete(): Promise<void> {
		await KiwiConnector.sendRPCMethod(
			'TestExecution.remove',
			[{ id: this.getId() }]
		);
	}

	public static async getFromTestCase(
		testCase: TestCase | number
	):Promise<Array<TestExecution>> {
		const tcId: number =
			testCase instanceof TestCase
				? testCase.getId()
				: testCase;
		return this.serverFilter({
			case: tcId
		});
	}

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
