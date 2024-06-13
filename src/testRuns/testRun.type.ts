export type TestRunValues = {
	id: number;
	start_date: string | null;
	stop_date: string | null;
	planned_start: string | null;
	planned_stop: string | null;
	summary: string;
	notes: string;
	plan: number;
	plan__name: string;
	build: number;
	build__name: string;
	build__version: number;
	build__version__product: number;
	build__version__value: string;
	manager: number;
	manager__username: string;
	default_tester: number | null;
	default_tester__username: string | null;
}

export type TestRunComputedFields = {
	id: number;
	plan__name: string;
	build__name: string;
	build__version: number;
	build__version__product: number;
	build__version__value: string;
	manager__username: string;
	default_tester__username: string | null;
}

export type TestRunWriteValues =
	Omit<TestRunValues, keyof TestRunComputedFields>;

export type TestRunUpdateResponse =
	TestRunWriteValues & {
		id: number;
	};

export type TestRunCreateValues =
	Partial<TestRunWriteValues> & {
		summary: string;
		manager: number;
		plan: number;
		build: number;
	};

export type TestRunCaseEntry = {
	id: number;
	create_date: string;
	is_automated: boolean;
	script: string;
	arguments: string;
	extra_link: string | null;
	summary: string;
	requirement: string | null;
	notes: string;
	text: string;
	case_status: number;
	category: number;
	priority: number;
	author: number;
	default_tester: number | null;
	reviewer: number | null;
	execution_id: number;
	status: string;
}
