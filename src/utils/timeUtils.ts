
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

	/**
	 * Converts number of seconds into a string representation
	 * @param totalSeconds Number of seconds
	 * @returns Duration represented in `h:mm:ss` format string
	 */
	public static secondsToTimeString(
		totalSeconds: number | undefined | null
	): string {
		if (!totalSeconds) return '0:00:00';
		const hours = Math.floor(totalSeconds / 3600);
		const remainder = totalSeconds % 3600;
		const min = Math.floor(remainder / 60);
		const sec = remainder % 60;
		 
		return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
	}
}
