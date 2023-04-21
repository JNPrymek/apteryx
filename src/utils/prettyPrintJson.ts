/* eslint-disable-next-line max-len */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
export default function prettyPrintJson(json: any): void {
	console.log(JSON.stringify(json, null, '\t'));
}