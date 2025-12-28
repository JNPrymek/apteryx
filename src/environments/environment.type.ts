export type EnvironmentValues = {
	id: number;
	name: string;
	description: string;
};

export type EnvironmentWriteValues = Omit<EnvironmentValues, 'id'>;
