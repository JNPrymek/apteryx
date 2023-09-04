import KiwiBaseItem from '../core/kiwiBaseItem';
import KiwiConnector from '../core/kiwiConnector';
import { EnvironmentPropertyValues } from './environmentProperty.type';

export default class EnvironmentProperty extends KiwiBaseItem {

	public getName(): string {
		return this.serialized.name as string;
	}

	public getValue(): string {
		return this.serialized.value as string;
	}

	public getEnvironmentId(): number {
		return this.serialized.environment as number;
	}
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<EnvironmentProperty>> {
		const rawVals = await KiwiConnector.sendRPCMethod(
			'Environment.properties',
			[filterObj]
		) as Array<EnvironmentPropertyValues>;
		const results: Array<EnvironmentProperty> = [];
		rawVals.forEach(item => {
			results.push(new EnvironmentProperty(item));
		});
		return results;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<EnvironmentProperty>> {
		const idArray = Array.isArray(id) ? id : [ id ];
		return this.serverFilter({ id__in: idArray });
	}
	
	public static async getById(
		id: number
	): Promise<EnvironmentProperty> {
		const results = await this.getByIds(id);
		if (results.length == 0) {
			/* eslint-disable-next-line max-len */
			throw new Error(`Could not find any Environment Property with ID ${id}`);
		}
		return results[0];
	}
}
