import { describe, expect, it } from '@jest/globals';
import prettyPrintJson from './prettyPrintJson';
import TimeUtils from './timeUtils';

describe('Utility Functions', () => {
	it('prettyPrintJson prints JSON-like things with proper formatting', () => {
		console.log = jest.fn();
		const myObj = { id: 123, name: 'Bob', b: 'valB' };

		const prettyPrintResults = '{\n\t"id": 123,\n\t"name": "Bob",\n\t"b": "valB"\n}';

		prettyPrintJson(myObj);
		expect(console.log).toHaveBeenCalledWith(prettyPrintResults);
	});

	describe('Time Utils', () => {
		it('Can convert Kiwi Server date strings to Dates', () => {
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

		it('Can convert Date to Kiwi Server date string', () => {
			const begin2021Val = new Date(1609459200000);
			const realisticVal = new Date(1635046679158);

			expect(TimeUtils.dateToServerString(begin2021Val))
				.toEqual('2021-01-01T00:00:00.000');
			expect(TimeUtils.dateToServerString(realisticVal))
				.toEqual('2021-10-24T03:37:59.158');
		});

		it('Can convert number of seconds into an h:mm:ss time string', () => {
			expect(TimeUtils.secondsToTimeString(1)).toEqual('0:00:01');
			expect(TimeUtils.secondsToTimeString(60)).toEqual('0:01:00');
			expect(TimeUtils.secondsToTimeString(3600)).toEqual('1:00:00');
			expect(TimeUtils.secondsToTimeString(36072)).toEqual('10:01:12');
			expect(TimeUtils.secondsToTimeString(null)).toEqual('0:00:00');
		});
	});
});
