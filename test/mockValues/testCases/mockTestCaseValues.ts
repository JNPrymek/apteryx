import { 
	TestCaseUpdateResponseValues, 
	TestCaseValues 
} from '../../../src/testCases/testCase.type';
import testCaseDefaults from './testCase.json';
export function mockTestCase(
	overrideValues?: Partial<TestCaseValues>
): TestCaseValues {
	return {
		...testCaseDefaults,
		...overrideValues
	};
}

import testCaseUpdateResponseValues from './testCase_update.json';
export function mockTestCaseUpdateResponse(
	overrideValues?: Partial<TestCaseUpdateResponseValues>
): TestCaseUpdateResponseValues {
	return {
		...testCaseUpdateResponseValues,
		...overrideValues
	};
}

import { TestCaseStatusValues } 
	from '../../../src/testCases/testCaseStatus.type';
import testCaseStatusDefaults from './testCaseStatus.json';
export function mockTestCaseStatus(
	overrideValues?: Partial<TestCaseStatusValues>
): TestCaseStatusValues {
	return {
		...testCaseStatusDefaults,
		...overrideValues
	};
}

import { CategoryValues } 
	from '../../../src/testCases/category.type';
import categoryDefaults from './category.json';

export function mockCategory(
	overrideValues?: Partial<CategoryValues>
): CategoryValues {
	return {
		...categoryDefaults,
		...overrideValues
	};
}

