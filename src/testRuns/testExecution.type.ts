export type TestExecutionValues = {
	id: number;
	assignee: number | null;
	assignee__username: string | null;
	tested_by: number | null;
	tested_by__username: string | null;
	case_text_version: number;
	start_date: string | null;
	stop_date: string | null;
	sortkey: number;
	run: number;
	case: number;
	case__summary: string;
	build: number;
	build__name: string;
	status: number;
	status__name: string;
}
