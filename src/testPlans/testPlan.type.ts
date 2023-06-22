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
}

export type TestPlanComputedFields = {
	id: number;
	product_version__value: string;
	product__name: string;
	author__username: string;
	type__name: string;
}

export type TestPlanWriteValues = 
	Omit<TestPlanValues, keyof TestPlanComputedFields>;

export type TestPlanUpdateResponse = TestPlanWriteValues & {
	id: number;
};
