
export default class TimeUtils {
	
	public static serverStringToDate(rawString: string) : Date {
		return new Date(`${rawString}Z`);
	}

	public static dateToServerString(rawDate: Date) : string {
		const year = rawDate.getUTCFullYear();
		const day = (rawDate.getUTCDate())
			.toString()
			.padStart(2, '0');
		const month = (rawDate.getUTCMonth() + 1)
			.toString()
			.padStart(2, '0');
		const hours = (rawDate.getUTCHours())
			.toString()
			.padStart(2, '0');
		const min = (rawDate.getUTCMinutes())
			.toString()
			.padStart(2, '0');
		const sec = (rawDate.getUTCSeconds())
			.toString()
			.padStart(2, '0');
		const milli = (rawDate.getUTCMilliseconds())
			.toString()
			.padStart(3, '0');
		return `${year}-${month}-${day}T${hours}:${min}:${sec}.${milli}`;
	}
}