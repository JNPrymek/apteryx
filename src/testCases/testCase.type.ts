/**
 * Full TestCase values returned by Kiwi when filtering entries.
 */
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

/**
 * Computed fields depend on values of other fields.
 * Cannot be directly set by the client.
 */
type TestCaseComputedFields = {
	id: number;
	case_status__name: string;
	category__name: string;
	priority__value: string;
	author__username: string;
	default_tester__username: string;
	reviewer__username: string;
	expected_duration: number;
}

/**
 * TestCase values that can be directly set by the client.
 * Some values allow `null` to be written, 
 * despite using other types in TestCase.filter().
 */
export type TestCaseWriteValues = 
	Omit<TestCaseValues, keyof TestCaseComputedFields> & {
		script: string | null;
		arguments: string | null;
		notes: string | null;
		text: string | null;
		// Kiwi technically allows `summary` to be null / ""
		// But there is no good reason to do that
	};

export type TestCaseUpdateResponseValues = {
	id: number;
	is_automated: boolean;
	script: string;
	arguments: string;
	extra_link: string | null;
	summary: string;
	requirement: string | null;
	notes: string;
	text: string;
	setup_duration: string;
	testing_duration: string;
	case_status: number;
	category: number;
	priority: number;
	author: number;
	default_tester: number | null;
	reviewer: number | null;
	create_date: string;
	case_status__name: string;
	category__name: string;
	priority__value: string;
	author__username: string;
	default_tester__username: string | null;
	reviewer__username: string | null;
};
