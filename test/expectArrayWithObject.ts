/*
	eslint-disable 
	@typescript-eslint/no-explicit-any, 
	@typescript-eslint/explicit-module-boundary-types 
*/
export default function expectArrayWithObject(
	container: Array<any>, 
	obj: Record<string, unknown>
): void {
	expect(container)
		.toEqual(
			expect.arrayContaining(
				[ expect.objectContaining(obj) ]
			)
		);
}