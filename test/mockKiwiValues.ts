
import { TestCaseValues } from '../src/testCases/testCase.type';
import testCaseDefaults from './mockValues/testCases/testCase.json';
export function mockTestCase(
	overrideValues: Partial<TestCaseValues>
): TestCaseValues {
	return {
		...testCaseDefaults,
		...overrideValues
	};
}