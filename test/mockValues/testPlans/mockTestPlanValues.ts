import { TestPlanValues } from '../../../src/testPlans/testPlan.type';
import testPlanDefaults from './testPlan.json';

export function mockTestPlan(
	overrideValues: Partial<TestPlanValues>
): TestPlanValues {
	return {
		...testPlanDefaults,
		...overrideValues
	};
}

import { PlanTypeValues } from '../../../src/testPlans/planType.type';
import planTypeDefaults from './planType.json';

export function mockTestPlanType(
	overrideValues: Partial<PlanTypeValues>
): PlanTypeValues {
	return {
		...planTypeDefaults,
		...overrideValues
	};
}

export function mockPlanType(
	overrideValues: Partial<PlanTypeValues>
): PlanTypeValues {
	return mockTestPlanType(overrideValues);
}
