import { BuildValues } from '../../../src/management/build.type';
import buildDefaults from './build.json';

export function mockBuild(
	overrideValues?: Partial<BuildValues>
): BuildValues {
	return {
		...buildDefaults,
		...overrideValues
	};
}

import { ClassificationValues } 
	from '../../../src/management/classification.type';
import classificationDefaults from './classification.json';

export function mockClassification(
	overrideValues?: Partial<ClassificationValues>
): ClassificationValues {
	return {
		...classificationDefaults,
		...overrideValues
	};
}


import { ComponentValues, ComponentServerValues }
	from '../../../src/management/component.type';
import componentServerDefaults from './component.json';

const componentDefaults: ComponentValues = { ...componentServerDefaults };

export function mockComponent(
	overrideValues?: Partial<ComponentValues>
): ComponentValues {
	return {
		...componentDefaults,
		...overrideValues
	};
}

export function mockComponentServerEntry(
	overrideValues?: Partial<ComponentServerValues>
): ComponentServerValues {
	return {
		...componentServerDefaults,
		cases: null,
		...overrideValues
	};
}

import { PriorityValues } 
	from '../../../src/management/priority.type';
import priorityDefaults from './priority.json';

export function mockPriority(
	overrideValues?: Partial<PriorityValues>
): PriorityValues {
	return {
		...priorityDefaults,
		...overrideValues
	};
}

import { ProductValues } 
	from '../../../src/management/product.type';
import productDefaults from './product.json';

export function mockProduct(
	overrideValues?: Partial<ProductValues>
): ProductValues {
	return {
		...productDefaults,
		...overrideValues
	};
}

import { TagValues } 
	from '../../../src/management/tag.type';
import tagDefaults from './tag.json';

export function mockTag(
	overrideValues?: Partial<TagValues>
): TagValues {
	return {
		...tagDefaults,
		...overrideValues
	};
}

import { UserValues } 
	from '../../../src/management/user.type';
import userDefaults from './user.json';

export function mockUser(
	overrideValues?: Partial<UserValues>
): UserValues {
	return {
		...userDefaults,
		...overrideValues
	};
}

import { VersionValues } 
	from '../../../src/management/version.type';
import versionDefaults from './version.json';

export function mockVersion(
	overrideValues?: Partial<VersionValues>
): VersionValues {
	return {
		...versionDefaults,
		...overrideValues
	};
}
