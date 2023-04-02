import KiwiNamedItem from '../core/kiwiNamedItem';
import { ClassificationValues } from './classification.type';

export default class Classification extends KiwiNamedItem {
	
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<Classification> {
		return await super.getByName(name) as Classification;
	}
	
	public static async serverFilter(
		filterObj: ClassificationValues
	): Promise<Array<Classification>> {
		return await super.serverFilter(filterObj) as Array<Classification>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Classification>> {
		return await super.getByIds(id) as Array<Classification>;
	}
	
	public static async getById(
		id: number
	): Promise<Classification> {
		return await super.getById(id) as Classification;
	}
}