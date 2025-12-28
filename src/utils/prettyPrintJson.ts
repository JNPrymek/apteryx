/* eslint-disable @typescript-eslint/no-explicit-any */
export default function prettyPrintJson(json: any): void {
	console.log(JSON.stringify(json, null, '\t'));
}
