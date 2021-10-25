import prettyPrintJson from './prettyPrintJson';

describe('Utility Functions', () => {
	
	it('prettyPrintJson prints JSON-like things with proper formatting',
		() => {
			console.log = jest.fn();
			const myObj = { id: 123, name: 'Bob', b: 'valB' };
			
			const prettyPrintResults = '{\n\t"id": 123,\n\t"name": "Bob",\n\t"b": "valB"\n}';
			
			prettyPrintJson(myObj);
			expect(console.log).toHaveBeenCalledWith(prettyPrintResults);
		});
	
});