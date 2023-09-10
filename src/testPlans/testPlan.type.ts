import { 
	TestCaseComputedFields,
	TestCaseValues
} from '../testCases/testCase.type';

export type TestPlanValues = {
	id: number;
	name: string;
	text: string;
	create_date: string;
	is_active: boolean;
	extra_link: string | null;
	product_version: number;
	product_version__value: string;
	product: number;
	product__name: string;
	author: number;
	author__username: string;
	type: number;
	type__name: string;
	parent: number | null;
	children__count: number;
}

export type TestPlanComputedFields = {
	id: number;
	product_version__value: string;
	product__name: string;
	author__username: string;
	type__name: string;
	children__count: number;
}

export type TestPlanWriteValues = 
	Omit<TestPlanValues, keyof TestPlanComputedFields>;

export type TestPlanUpdateResponse = TestPlanWriteValues & {
	id: number;
};

export type TestPlanCreateValues = Partial<TestPlanWriteValues> & {
	product: number;
	product_version: number;
	type: number;
	name: string;
}

export type TestPlanCreateResponse =
Omit<TestPlanValues,
'product_version__value' |
'product__name' |
'author__username' |
'type__name' |
'children__count'
>

export type TestPlanAddCaseResponse =
	Omit<TestCaseValues, keyof TestCaseComputedFields> & {
		id: number;
		sortkey: number;
	}
