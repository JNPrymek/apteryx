import prettyPrintJson from './prettyPrintJson';
import TimeUtils from './timeUtils';

describe('Utility Functions', () => {
	
	it('prettyPrintJson prints JSON-like things with proper formatting',
		() => {
			console.log = jest.fn();
			const myObj = { id: 123, name: 'Bob', b: 'valB' };
			
			const prettyPrintResults = '{\n\t"id": 123,\n\t"name": "Bob",\n\t"b": "valB"\n}';
			
			prettyPrintJson(myObj);
			expect(console.log).toHaveBeenCalledWith(prettyPrintResults);
		});
	
	describe('Time Utils', () => {
		
		it('Can interpret Kiwi Server date strings', () => {
			// First millisecond of year 2021
			const begin2021String = '2021-01-01T00:00:00.000';
			const begin2021Val = 1609459200000;
			const begin2021Date = TimeUtils.serverStringToDate(begin2021String);
			expect(begin2021Date.valueOf()).toEqual(begin2021Val);
			
			// Random (realistic) date-time
			const realisticString = '2021-10-24T03:37:59.158';
			const realisticVal = 1635046679158;
			const realisticDate = TimeUtils.serverStringToDate(realisticString);
			expect(realisticDate.valueOf()).toEqual(realisticVal);
		});
	});
});