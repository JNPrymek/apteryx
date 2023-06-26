import { 
	TestPlanUpdateResponse,
	TestPlanValues
} from '../../../src/testPlans/testPlan.type';
import testPlanDefaults from './testPlan.json';

export function mockTestPlan(
	overrideValues?: Partial<TestPlanValues>
): TestPlanValues {
	return {
		...testPlanDefaults,
		...overrideValues
	};
}

import testPlanUpdateValDefaults from './testPlan_update.json';
export function mockTestPlanUpdateResponse(
	overrideValues?: Partial<TestPlanUpdateResponse>
): TestPlanUpdateResponse {
	return {
		...testPlanUpdateValDefaults,
		...overrideValues
	};
}

import { PlanTypeValues } from '../../../src/testPlans/planType.type';
import planTypeDefaults from './planType.json';

export function mockTestPlanType(
	overrideValues?: Partial<PlanTypeValues>
): PlanTypeValues {
	return {
		...planTypeDefaults,
		...overrideValues
	};
}

export function mockPlanType(
	overrideValues?: Partial<PlanTypeValues>
): PlanTypeValues {
	return mockTestPlanType(overrideValues);
}
