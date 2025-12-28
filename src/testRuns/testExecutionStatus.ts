import KiwiNamedItem from '../core/kiwiNamedItem';

export default class TestExecutionStatus extends KiwiNamedItem {
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getWeight(): number {
		return this.serialized['weight'] as number;
	}

	public getIcon(): string {
		return this.serialized['icon'] as string;
	}

	public getColor(): string {
		return this.serialized['color'] as string;
	}

	public getColorHex(): string {
		return this.getColor();
	}

	public isPositive(): boolean {
		return this.getWeight() > 0;
	}

	public isNegative(): boolean {
		return this.getWeight() < 0;
	}

	public isNeutral(): boolean {
		return this.getWeight() == 0;
	}

	public static async resolveId(
		status: string | number | TestExecutionStatus,
	): Promise<number> {
		if (typeof status === 'number') {
			return status;
		} else if (status instanceof TestExecutionStatus) {
			return status.getId();
		} else { // typeof status = 'string'
			const exStat = await TestExecutionStatus.getByName(status);
			return exStat.getId();
		}
	}

	// Inherited methods
	// ------------------------------------------------------------------------

	// Kiwi Named
	// --------------------------------

	public static async getByName(
		name: string,
	): Promise<TestExecutionStatus> {
		return await super.getByName(name) as TestExecutionStatus;
	}

	public static async serverFilter(
		filterObj: Record<string, unknown>,
	): Promise<Array<TestExecutionStatus>> {
		return await super
			.serverFilter(filterObj) as Array<TestExecutionStatus>;
	}

	public static async getByIds(
		id: number | Array<number>,
	): Promise<Array<TestExecutionStatus>> {
		return await super.getByIds(id) as Array<TestExecutionStatus>;
	}

	public static async getById(
		id: number,
	): Promise<TestExecutionStatus> {
		return await super.getById(id) as TestExecutionStatus;
	}
}
