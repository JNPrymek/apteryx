export type TagValues = {
	id: number;
	name: string;
}

export type TagServerValues = 
	TagValues & {
		case: number | null;
		plan: number | null;
		run: number | null;
		bugs: number | null;
	}