export type TestExecutionValues = {
	id: number;
	assignee: number | null;
	assignee__username: string | null;
	tested_by: number | null;
	tested_by__username: string | null;
	case_text_version: number;
	start_date: string | null;
	stop_date: string | null;
	expected_duration: number;
	actual_duration: number | null;
	sortkey: number;
	run: number;
	case: number;
	case__summary: string;
	build: number;
	build__name: string;
	status: number;
	status__name: string;
	status__icon: string;
	status__color: string;
};

export type TestExecutionCalculatedValues = {
	id: number;
	assignee__username: string | null;
	tested_by__username: string | null;
	case__summary: string;
	build__name: string;
	status__name: string;
	status__icon: string;
	status__color: string;
	expected_duration: number;
	actual_duration: number | null;
};

export type TestExecutionWriteValues = Omit<TestExecutionValues, keyof TestExecutionCalculatedValues>;

type Property = {
	name: string;
	value: string;
};

export type TestExecutionCreateResponse = TestExecutionWriteValues & {
	id: number;
	properties: Array<Property>;
};
