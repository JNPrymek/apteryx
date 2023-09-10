import environmentDefaults from './environment.json';
import { EnvironmentValues } from '../../../src/environments/environment.type';
export function mockEnvironment(
	overrideValues?: Partial<EnvironmentValues>
): EnvironmentValues {
	return {
		...environmentDefaults,
		...overrideValues,
	};
}

import environmentPropertyDefaults from './environmentProperty.json';
import {
	EnvironmentPropertyValues
} from '../../../src/environments/environmentProperty.type';
export function mockEnvironmentProperty(
	overrideValues?: Partial<EnvironmentPropertyValues>
): EnvironmentPropertyValues {
	return {
		...environmentPropertyDefaults,
		...overrideValues
	};
}
