
import { TestExecutionValues } from '../../../src/testRuns/testExecution.type';
import testExecutionDefaults from './testExecution.json';

export function mockTestExecution(
	overrideValues?: Partial<TestExecutionValues>
): TestExecutionValues {
	return {
		...testExecutionDefaults,
		...overrideValues
	};
}

import { TestExecutionStatusValues } 
	from '../../../src/testRuns/testExecutionStatus.type';
import testExecutionStatusDefaults from './testExecutionStatus.json';

export function mockTestExecutionStatus(
	overrideValues?: Partial<TestExecutionStatusValues>
): TestExecutionStatusValues {
	return {
		...testExecutionStatusDefaults,
		...overrideValues
	};
}

import { TestRunValues } 
	from '../../../src/testRuns/testRun.type';
import testRunDefaults from './testRun.json';

export function mockTestRun(
	overrideValues?: Partial<TestRunValues>
): TestRunValues {
	return {
		...testRunDefaults,
		...overrideValues
	};
}

import { TestRunUpdateResponse } from '../../../src/testRuns/testRun.type';
import testRunUpdateResponseDefaults from './testRun_update.json';
export function mockTestRunUpdateResponse(
	overrideValues?: Partial<TestRunUpdateResponse>
): TestRunUpdateResponse {
	return {
		...testRunUpdateResponseDefaults,
		...overrideValues
	};
}

import { TestRunCaseEntry } from '../../../src/testRuns/testRun.type';
import testRunCaseListDefaults from './testRun_caseList.json';
export function mockTestRunCaseListItem(
	overrideValues?: Partial<TestRunCaseEntry>
): TestRunCaseEntry {
	return {
		...testRunCaseListDefaults,
		...overrideValues
	};
}

import testExecutionCreateDefaults from './testExecution_create.json';
import {
	TestExecutionCreateResponse
} from '../../../src/testRuns/testExecution.type';
export function mockTestExecutionCreateResponse(
	overrideValues?: Partial<TestExecutionCreateResponse>
): TestExecutionCreateResponse {
	return {
		...testExecutionCreateDefaults,
		...overrideValues
	};
}

import environmentDefaults from './environment.json';
import { EnvironmentValues } from '../../../src/testRuns/environment.type';
export function mockEnvironment(
	overrideValues?: Partial<EnvironmentValues>
): EnvironmentValues {
	return {
		...environmentDefaults,
		...overrideValues,
	};
}
