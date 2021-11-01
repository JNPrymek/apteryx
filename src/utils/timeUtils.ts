
export default class TimeUtils {
	
	public static serverStringToDate(rawString: string) : Date {
		return new Date(`${rawString}Z`);
	}
}