import KiwiBaseItem from '../core/kiwiBaseItem';
import KiwiConnector from '../core/kiwiConnector';
import { TagServerValues, TagValues } from './tag.type';

export default class Tag extends KiwiBaseItem {
	
	constructor(serializedValues: TagValues | TagServerValues) {
		super(serializedValues);
		// Remove properties for tag associations
		delete this.serialized.case;
		delete this.serialized.plan;
		delete this.serialized.run;
		delete this.serialized.bugs;
	}
	
	// Names are not unique, so cannot inherit from KiwiNamedItem
	public getName(): string {
		return this.serialized.name as string;
	}
	
	// Non-unique names - error on multiple matches
	public static async getByName(
		name: string
	): Promise<Tag> {
		const tagList: Array<Tag> = await this.serverFilter({ name: name });
		switch (tagList.length) {
			case 0:
				throw new Error(`Tag with name '${name}' not found.`);
			case 1:
				return tagList[0];
			default:
				throw new Error(
					`Attempted to get Tag with non-unique name '${name}'`
				);
		}
	}
	
	
	// Get serialized entries as returned by Kiwi
	// (1x entry per association with a case, plan, run, or bug)
	private static async serverFilterDistinct(
		filterObject: Record<string, unknown>
	): Promise<Array<TagServerValues>> {
		return await KiwiConnector.sendRPCMethod(
			`${this.name}.filter`,
			[ filterObject ]
		) as Array<TagServerValues>;
	}
	
	private static async serverFilterCaseTags(
		filterObject: Record<string, unknown>
	): Promise<Array<TagServerValues>> {
		return await this.serverFilterDistinct(
			{ ...filterObject, 'case__isnull': false }
		);
	}
	
	private static async serverFilterPlanTags(
		filterObject: Record<string, unknown>
	): Promise<Array<TagServerValues>> {
		return await this.serverFilterDistinct(
			{ ...filterObject, 'plan__isnull': false }
		);
	}
	
	private static async serverFilterRunTags(
		filterObject: Record<string, unknown>
	): Promise<Array<TagServerValues>> {
		return await this.serverFilterDistinct(
			{ ...filterObject, 'run__isnull': false }
		);
	}
	
	private static async serverFilterBugTags(
		filterObject: Record<string, unknown>
	): Promise<Array<TagServerValues>> {
		return await this.serverFilterDistinct(
			{ ...filterObject, 'bugs__isnull': false }
		);
	}
	
	// Remove properties for cases, runs, plans, and bugs
	// Then return de-duped list as Tags.
	private static async getUniqueTags(
		filterObj: Record<string, unknown>
	): Promise<Array<Tag>> {
		const distinctResults = await this.serverFilterDistinct(filterObj);
		const tagList: Array<Tag> = [];
		const tagIds: Array<number> = [];
		
		for (const distinctItem of distinctResults) {
			const id = distinctItem.id as number;
			if (!tagIds.includes(id)) {
				const tagProps: TagValues = { 
					id: distinctItem.id, 
					name: distinctItem.name 
				};
				const tag = new Tag(tagProps);
				tagIds.push(id);
				tagList.push(tag);
			}
		}
		
		return tagList;
	}
	
	public async getTaggedTestCaseIds(): Promise<Array<number>> {
		const distinctTags = 
			await Tag.serverFilterCaseTags({ id: this.getId() });
		const idList: Array<number> = [];
		
		for (const tag of distinctTags) {
			// Server filter method should not return null values
			idList.push(tag.case as number);
		}
		return idList;
	}
	
	public async getTaggedTestRunIds(): Promise<Array<number>> {
		const distinctTags = 
		await Tag.serverFilterRunTags({ id: this.getId() });
		const idList: Array<number> = [];
		
		for (const tag of distinctTags) {
			// Server filter method should not return null values
			idList.push(tag.run as number);
		}
		return idList;
	}
	
	public async getTaggedTestPlanIds(): Promise<Array<number>> {
		const distinctTags = 
		await Tag.serverFilterPlanTags({ id: this.getId() });
		const idList: Array<number> = [];
		
		for (const tag of distinctTags) {
			// Server filter method should not return null values
			idList.push(tag.plan as number);
		}
		return idList;
	}
	
	public async getTaggedBugIds(): Promise<Array<number>> {
		const distinctTags = 
		await Tag.serverFilterBugTags({ id: this.getId() });
		const idList: Array<number> = [];
		
		for (const tag of distinctTags) {
			// Server filter method should not return null values
			idList.push(tag.bugs as number);
		}
		return idList;
	}
	
	// Inherited methods
	// ------------------------------------------------------------------------
	
	// Kiwi Base
	// --------------------------------
	
	public static async serverFilter(
		filterObj: Record<string, unknown>
	): Promise<Array<Tag>> {
		return await this.getUniqueTags(filterObj);
	}
	
	public static async getByIds(
		id: number | Array<number>
	): Promise<Array<Tag>> {
		return await super.getByIds(id) as Array<Tag>;
	}
	
	public static async getById(
		id: number
	): Promise<Tag> {
		return await super.getById(id) as Tag;
	}
	
	// ------------------------------------------------------------------------
}