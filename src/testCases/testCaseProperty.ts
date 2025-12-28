import KiwiBaseItem from '../core/kiwiBaseItem';
import KiwiConnector from '../core/kiwiConnector';
import { TestCasePropertyValues } from './testCaseProperty.type';

export default class TestCaseProperty extends KiwiBaseItem {

	public getName(): string {
		return this.serialized.name as string;
	}

	public getValue(): string {
		return this.serialized.value as string;
	}

	public getCaseId(): number {
		return this.serialized.case as number;
	}

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<TestCaseProperty>> {
		const rawVals = await KiwiConnector.sendRPCMethod(
			'TestCase.properties',
			[filterObj]
		) as Array<TestCasePropertyValues>;
		const results: Array<TestCaseProperty> = [];
		rawVals.forEach(item => {
			results.push(new TestCaseProperty(item));
		});
		return results;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<TestCaseProperty>> {
		const idArray = Array.isArray(id) ? id : [ id ];
		return this.serverFilter({ id__in: idArray });
	}
	
	public static async getById(
		id: number
	): Promise<TestCaseProperty> {
		const results = await this.getByIds(id);
		if (results.length == 0) {
			 
			throw new Error(`Could not find any TestCase Property with ID ${id}`);
		}
		return results[0];
	}
}
