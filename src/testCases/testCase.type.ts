export type TestCaseValues = {
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
	case_status__name: string;
	category: number;
	category__name: string;
	priority: number;
	priority__value: string;
	author: number;
	author__username: string;
	default_tester: number | null;
	default_tester__username: string | null;
	reviewer: number | null;
	reviewer__username: string | null;
	setup_duration: number | null;
	testing_duration: number | null;
	expected_duration: number;
}