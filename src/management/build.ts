import KiwiNamedItem from '../core/kiwiNamedItem';
import Version from './version';

export default class Build extends KiwiNamedItem {
	// Constructor for all classes
	constructor(serializedValues: Record<string, unknown>) {
		super(serializedValues);
	}

	public getVersionId(): number {
		return this.serialized.version as number;
	}

	public getVersionValue(): string {
		return this.serialized['version__value'] as string;
	}

	public getIsActive(): boolean {
		return this.serialized['is_active'] as boolean;
	}

	public async getVersion(): Promise<Version> {
		return await Version.getById(this.getVersionId());
	}

	// Inherited methods
	// ------------------------------------------------------------------------

	// Kiwi Named
	// --------------------------------

	// Build names are only unique per version
	public static async getByName(name: string): Promise<Build>;
	public static async getByName(
		name: string,
		version: Version,
	): Promise<Build>;
	public static async getByName(
		name: string,
		version: number,
	): Promise<Build>;
	public static async getByName(
		name: string,
		version?: Version | number,
	): Promise<Build> {
		const nameMatches = await Build.serverFilter({ name: name });

		switch (nameMatches.length) {
			case 0: {
				throw new Error(
					`${this.name} with name "${name}" could not be found.`,
				);
			}
			case 1: {
				return nameMatches[0];
			}
			default: {
				if (version === undefined) {
					throw new Error(
						`Build '${name}' exists for multiple versions.  The 'version' param must be specified.`,
					);
				}

				// Coalesce to number
				const versionId = (version instanceof Version) ? version.getId() : version;

				const versionMatches = nameMatches.filter(build => {
					return (build.getVersionId() === versionId);
				});

				if (versionMatches.length === 0) {
					throw new Error(
						`${this.name} with name "${name}" could not be found.`,
					);
				} else {
					return versionMatches[0];
				}
			}
		}
	}

	// Kiwi Base
	// --------------------------------

	public static async serverFilter(
		filterObj: Record<string, unknown>,
	): Promise<Array<Build>> {
		return await super.serverFilter(filterObj) as Array<Build>;
	}

	public static async getByIds(
		id: number | Array<number>,
	): Promise<Array<Build>> {
		return await super.getByIds(id) as Array<Build>;
	}

	public static async getById(
		id: number,
	): Promise<Build> {
		return await super.getById(id) as Build;
	}
}
