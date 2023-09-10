import KiwiConnector from '../core/kiwiConnector';
import KiwiNamedItem from '../core/kiwiNamedItem';
import { EnvironmentValues, EnvironmentWriteValues } from './environment.type';
import EnvironmentProperty from './environmentProperty';
import { EnvironmentPropertyValues } from './environmentProperty.type';

export default class Environment extends KiwiNamedItem {
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getDescription(): string {
		return this.serialized.description as string;
	}

	public async getProperties(): Promise<Array<EnvironmentProperty>> {
		return EnvironmentProperty.getPropertiesForEnvironment(this.getId());
	}

	public async getPropertyKeys(): Promise<Array<string>> {
		const props = await this.getProperties();
		// Use a Set to de-dupe properties with multiple values
		const resultSet: Set<string> = new Set();
		props.forEach( prop => {
			resultSet.add(prop.getName());
		});
		return Array.from<string>(resultSet);
	}

	public async getPropertyValues(
		propertyName: string
	): Promise<Array<string>> {
		const props = await EnvironmentProperty.serverFilter({
			environment: this.getId(),
			name: propertyName,
		});
		const results: Array<string> = [];
		props.forEach( prop => {
			results.push(prop.getValue());
		});
		return results;
	}

	public async addProperty(
		propertyName: string,
		propertyValue: string
	): Promise<EnvironmentProperty> {
		const result = await KiwiConnector.sendRPCMethod(
			'Environment.add_property',
			[
				this.getId(),
				propertyName,
				propertyValue
			]
		);
		return new EnvironmentProperty(result as EnvironmentPropertyValues);
	}

	public async removeProperty(
		propertyName: string,
		propertyValue?: string
	): Promise<void> {
		const paramObj = {
			environment: this.getId(),
			name: propertyName,
			value: propertyValue
		};
		if(!propertyValue){
			delete paramObj.value;
		}
		await KiwiConnector.sendRPCMethod(
			'Environment.remove_property',
			[paramObj]
		);
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
