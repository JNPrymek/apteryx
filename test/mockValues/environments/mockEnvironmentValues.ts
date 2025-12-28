import { EnvironmentValues } from '../../../src/environments/environment.type';
import environmentDefaults from './environment.json';
export function mockEnvironment(
	overrideValues?: Partial<EnvironmentValues>,
): EnvironmentValues {
	return {
		...environmentDefaults,
		...overrideValues,
	};
}

import { EnvironmentPropertyValues } from '../../../src/environments/environmentProperty.type';
import environmentPropertyDefaults from './environmentProperty.json';
export function mockEnvironmentProperty(
	overrideValues?: Partial<EnvironmentPropertyValues>,
): EnvironmentPropertyValues {
	return {
		...environmentPropertyDefaults,
		...overrideValues,
	};
}
