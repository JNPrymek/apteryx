/*
id: 1
name: PROPOSED
description: ''
is_confirmed: false
*/

import KiwiNamedItem from '../core/kiwiNamedItem';

export default class TestCaseStatus extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public isConfirmed(): boolean {
		return this.serialized['is_confirmed'] as boolean;
	}

	public isRunnable(): boolean {
		return this.isConfirmed();
	}

	public getDescription(): string {
		return this.serialized['description'] as string;
	}

	public static async resolveStatusId(
		status: number | string | TestCaseStatus
	): Promise<number> {
		if (typeof status === 'number') return status;
		if (status instanceof TestCaseStatus) return status.getId();
		const caseStatus = await TestCaseStatus.getByName(status);
		return caseStatus.getId();
	}

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<TestCaseStatus> {
		return await super.getByName(name) as TestCaseStatus;
	}
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<TestCaseStatus>> {
		return await super.serverFilter(filterObj) as Array<TestCaseStatus>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<TestCaseStatus>> {
		return await super.getByIds(id) as Array<TestCaseStatus>;
	}
	
	public static async getById(
		id: number
	): Promise<TestCaseStatus> {
		return await super.getById(id) as TestCaseStatus;
	}
	
	// ------------------------------------------------------------------------
}