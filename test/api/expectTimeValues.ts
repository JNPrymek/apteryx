import { expect } from 'chai';

// Mocha/Chai assertion helper
export function expectTimeValue(value: unknown, failureMessage?: string): void {
	if (Number.isInteger(value)) {
		return; // Numeric value is acceptable
	}

	// It should be a string in hh:mm:ss format, or 'None'
	expect(typeof value).to.be.a('string', failureMessage);
	expect(value).to.match(/^(?:\d+:\d{2}:\d{2}|None)$/i, failureMessage);
}
