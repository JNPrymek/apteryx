
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
