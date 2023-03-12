export type TestRunValues = {
	id: number;
	plan__product_version: number;
	plan__product_version__value: string;
	start_date: string | null;
	stop_date: string | null;
	planned_start: string | null;
	planned_stop: string | null;
	summary: string;
	notes: string;
	plan: number;
	plan__product: number;
	plan__name: string;
	build: number;
	build__name: string;
	manager: number;
	manager__username: string;
	default_tester: number | null;
	default_tester__username: string | null;
}