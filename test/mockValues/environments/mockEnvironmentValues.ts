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
