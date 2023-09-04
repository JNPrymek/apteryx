import KiwiConnector from '../core/kiwiConnector';
import KiwiNamedItem from '../core/kiwiNamedItem';
import { EnvironmentValues, EnvironmentWriteValues } from './environment.type';

export default class Environment extends KiwiNamedItem {
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getDescription(): string {
		return this.serialized.description as string;
	}

	public static async create(
		envInfo: EnvironmentWriteValues
	): Promise<Environment> {
		const results = await KiwiConnector.sendRPCMethod(
			'Environment.create',
			[ envInfo ]
		);
		return new Environment(results as EnvironmentValues);
	}

	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	
	public static async getByName(
		name: string
	): Promise<Environment> {
		return await super.getByName(name) as Environment;
	}
	
	public static async serverFilter(
		filterObj: Partial<EnvironmentValues>
	): Promise<Array<Environment>> {
		return await super.serverFilter(filterObj) as Array<Environment>;
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Environment>> {
		return await super.getByIds(id) as Array<Environment>;
	}
	
	public static async getById(
		id: number
	): Promise<Environment> {
		return await super.getById(id) as Environment;
	}
}
