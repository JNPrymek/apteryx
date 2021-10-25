import expectArrayWithObject from './expectArrayWithObject';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function expectArrayWithKiwiItem(
	container: Array<any>, 
	item: Record<string, unknown>
) : void {
	const kiwiObj = { serialized: expect.objectContaining(item) };
	expectArrayWithObject(container, kiwiObj);
}