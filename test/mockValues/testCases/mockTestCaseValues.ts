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

export function mockTestPlanAddCaseResponse(
	overrideValues?: Partial<TestPlanAddCaseResponse>
): TestPlanAddCaseResponse {
	const tcVals = mockTestCase();
	return {
		id: tcVals.id,
		is_automated: tcVals.is_automated,
		script: tcVals.script,
		arguments: tcVals.arguments,
		extra_link: tcVals.extra_link,
		summary: tcVals.summary,
		requirement: tcVals.requirement,
		notes: tcVals.notes,
		text: tcVals.text,
		setup_duration: tcVals.setup_duration,
		testing_duration: tcVals.testing_duration,
		case_status: tcVals.case_status,
		category: tcVals.category,
		priority: tcVals.priority,
		author: tcVals.author,
		default_tester: tcVals.default_tester,
		reviewer: tcVals.reviewer,
		create_date: tcVals.create_date,
		sortkey: 10,
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
import { TestPlanAddCaseResponse } from '../../../src/testPlans/testPlan.type';

export function mockCategory(
	overrideValues?: Partial<CategoryValues>
): CategoryValues {
	return {
		...categoryDefaults,
		...overrideValues
	};
}

