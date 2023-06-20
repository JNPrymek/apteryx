export type ComponentValues = {
	id: number;
	name: string;
	product: number;
	initial_owner: number;
	initial_qa_contact: number;
	description: string;
}

export type ComponentServerValues = 
	ComponentValues & {
		cases: number | null;
	}
