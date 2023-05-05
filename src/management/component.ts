import KiwiConnector from '../core/kiwiConnector';
import KiwiNamedItem from '../core/kiwiNamedItem';
import { ComponentServerValues, ComponentValues } from './component.type';
import Product from './product';
import User from './user';

export default class Component extends KiwiNamedItem {
	
	// Constructor for all classes
	constructor(serializedValues: ComponentValues|ComponentServerValues) {
		super(serializedValues);
		delete this.serialized.cases;
	}
	
	public getProductId(): number {
		return this.serialized.product as number;
	}
	
	public async getProduct(): Promise<Product> {
		return await Product.getById(this.getProductId());
	}
	
	public getInitialOwnerId(): number {
		return this.serialized['initial_owner'] as number;
	}
	
	public async getInitialOwner(): Promise<User> {
		return await User.getById(this.getInitialOwnerId());
	}
	
	public getInitialQaContactId(): number {
		return this.serialized['initial_qa_contact'] as number;
	}
	
	public async getInitialQaContact(): Promise<User> {
		return await User.getById(this.getInitialQaContactId());
	}
	
	public getDescription(): string {
		return this.serialized.description as string;
	}
	
	// Get IDs of all the test cases linked to this component
	public async getLinkedTestCaseIds(): Promise<Array<number>> {
		const distinctComps = await Component
			.serverFilterDistinct({ id: this.getId() });
		const testCaseIds: Array<number> = [];
		for (const comp of distinctComps) {
			testCaseIds.push(comp.cases as number);
		}
		return testCaseIds;
	}
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Named
	// --------------------------------
	// Component names are only unique per product
	public static async getByName( name: string ): Promise<Component>;
	public static async getByName( 
		name: string, 
		product: Product
	): Promise<Component>;
	public static async getByName( 
		name: string, 
		product: number
	): Promise<Component>;
	public static async getByName(
		name: string,
		product?: Product | number
	): Promise<Component> {
		
		const nameMatches = await this.serverFilter({ name: name });
		
		// Coalesce product to ID number
		let prodId = -1;
		if(product !== undefined) {
			prodId = (product instanceof Product) ? product.getId() : product;
		}
		
		// Not found Errors
		const nameFailErr = new Error(
			`Component "${name}" could not be found.`
		);
		const prodNotSpecifiedErr = new Error(
			/* eslint-disable-next-line max-len */
			`Component '${name}' exists for multiple products.  The 'product' param must be specified.`);
		const prodFailErr = new Error(
			`Component "${name}" could not be found for product ${prodId}.`
		);
		
		switch (nameMatches.length) {
			case 0: {
				throw nameFailErr;
			}
			case 1: {
				
				if (prodId !== -1 && nameMatches[0].getId() !== prodId) {
					throw prodFailErr;
				}
				else {
					return nameMatches[0];
				}
			}
			default: {
				
				if (product === undefined) {
					throw prodNotSpecifiedErr;
				}
				
				const productMatches = nameMatches.filter( (comp) => {
					return (comp.getProductId() === prodId);
				});
				
				if (productMatches.length === 0) {
					throw prodFailErr;
				}
				else {
					return productMatches[0];
				}
			}
		}
	}
	
	// Kiwi Base
	// --------------------------------
	
	// Get serialized entries as returned by kiwi 
	// (1x entry per TestCase-Component relationship)
	private static async serverFilterDistinct(
		filterObj: Partial<ComponentServerValues>
	): Promise<Array<ComponentServerValues>> {
		return await KiwiConnector.sendRPCMethod(
			`${this.name}.filter`, 
			[filterObj]
		) as Array<ComponentServerValues>;
	}
	
	// Remove 'cases' property from serialized entries
	// Return deduped list as Components
	private static async getUniqueComponents(
		filterObj: Partial<ComponentServerValues>
	): Promise<Array<Component>> {
		const distinctResults = await this.serverFilterDistinct(filterObj);
		const compList: Array<Component> = [];
		const compIds: Array<number> = [];
		
		for (const distinctItem of distinctResults) {
			const id = distinctItem['id'] as number;
			if (!compIds.includes(id)) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { cases, ...compProps } = distinctItem;
				const comp = new Component(compProps as ComponentValues);
				compIds.push(id);
				compList.push(comp);
			}
		}
		return compList;
	}
	
	public static async serverFilter(
		filterObj: Partial<ComponentServerValues>
	): Promise<Array<Component>> {
		return await this.getUniqueComponents(filterObj);
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Component>> {
		return await super.getByIds(id) as Array<Component>;
	}
	
	public static async getById(
		id: number
	): Promise<Component> {
		return await super.getById(id) as Component;
	}

	// Reload values from server - unique component
	public async syncServerValues(): Promise<void> {
		const distinctList = await Component
			.serverFilterDistinct({ id: this.getId() });
		this.serialized = distinctList[0] as ComponentValues;
	}
	
	// ------------------------------------------------------------------------
}