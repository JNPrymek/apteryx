import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import Component from './component';
import Product from './product';
import { ComponentValues, ComponentServerValues } from './component.type';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Component', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	const serverComp1base: ComponentValues = {
		id: 1,
		name: 'First Component',
		product: 1,
		'initial_owner': 1,
		'initial_qa_contact': 2,
		description: 'The first component added to Kiwi'
	};
	const serverComp1: ComponentServerValues = {
		...serverComp1base,
		cases: null
	};
	
	const serverComp2base: ComponentValues = {
		id: 2,
		name: 'Second Component',
		product: 1,
		'initial_owner': 2,
		'initial_qa_contact': 1,
		description: 'The second component added to Kiwi',
	};
	const serverComp2: ComponentServerValues = {
		...serverComp2base,
		cases: null
	};
	
	const serverComp3base: ComponentValues = {
		id: 3,
		name: 'First Component',
		product: 2,
		'initial_owner': 1,
		'initial_qa_contact': 2,
		/* eslint-disable-next-line max-len */
		description: 'First Component of Prod2.  Happens to have a duplicate name as an existing component in Prod1.'
	};
	const serverComp3: ComponentServerValues = {
		...serverComp3base,
		cases: null
	};
	
	it('Can get by single ID - 0 TCs linked', async () => {
		mockAxios
			.post
			.mockResolvedValue(
				mockRpcResponse({ 
					result: [ serverComp1 ] 
				}));
		
		const comp = await Component.getById(1);
		expect(comp['serialized']).toEqual(serverComp1base);
	});
	
	it('Can get by single ID - 1 TC linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [ { ...serverComp1, cases: 1 }] }));
		
		const comp = await Component.getById(1);
		expect(comp['serialized']).toEqual(serverComp1base);
	});
	
	it('Can get by single ID - 2 TCs linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [ 
				{ ...serverComp1, cases: 1 },
				{ ...serverComp1, cases: 2 }
			] }));
		
		const comp = await Component.getById(1);
		expect(comp['serialized']).toEqual(serverComp1base);
		
	});
	
	it('Can get by multiple IDs - mix of TCs linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [ 
				{ ...serverComp1, cases: 1 },
				{ ...serverComp1, cases: 2 },
				{ ...serverComp2 }
			] }));
		
		const comps = await Component.getByIds([1, 2]);
		
		expectArrayWithKiwiItem(comps, serverComp1base);
		expectArrayWithKiwiItem(comps, serverComp2base);
	});
	
	it('Can get ID of Component', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getId()).toEqual(1);
	});
	
	it('Can get ID of Component Initial Owner', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getInitialOwnerId()).toEqual(1);
	});
	
	it('Can get ID of Component Initial QA Contact', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getInitialQaContactId()).toEqual(2);
	});
	
	it('Can get ID of Component Product', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getProductId()).toEqual(1);
	});
	
	it('Can get Component Product', async () => {
		const serverProd1 = {
			id: 1,
			name: 'Product the First',
			description: 'First product added to Kiwi',
			classification: 1
		};
		
		mockAxios
			.post
			.mockResolvedValue(mockRpcResponse({ result: [ serverProd1 ] }));
		
		const comp = new Component(serverComp1base);
		const compProd = await comp.getProduct();
		
		expect(compProd['serialized']).toEqual(serverProd1);
	});
	
	it('Can get Component description', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getDescription())
			.toEqual('The first component added to Kiwi');
	});
	
	it('Can get Component name', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getName()).toEqual('First Component');
	});
	
	it('Can get IDs of TestCases linked to Component', async () => {
		const comp = new Component(serverComp1base);
		
		// Mock distinct entries
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [ 
				{ ...serverComp1, cases: 1 },
				{ ...serverComp1, cases: 2 },
				{ ...serverComp1, cases: 5 }
			] }));
		
		const compTCs = await comp.getLinkedTestCaseIds();
		
		expect(compTCs).toEqual([1, 2, 5]);
	});
	
	it('Can get Component by name - 0 matches', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [] }));
		
		expect(Component.getByName('First Component'))
			.rejects
			.toThrowError('Component "First Component" could not be found.');
	});
	
	it('Can get Component by name - 1 matches', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1 }
			] }));
		
		const comp = await Component.getByName('First Component');
		
		expect(comp['serialized']).toEqual(serverComp1base);
		
	});
	
	/* eslint-disable-next-line max-len */
	it('Can get Component by name - multiple matches without product filter throws Error', 
		async () => {
		
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [
					{ ...serverComp1 },
					{ ...serverComp3 }
				] }));
		
			const name = 'First Component';
			expect(Component.getByName(name))
				.rejects
				/* eslint-disable-next-line max-len */
				.toThrowError(`Component '${name}' exists for multiple products.  The 'product' param must be specified`);
		});
	
	/* eslint-disable-next-line max-len */
	it('Can get Component by name - single match with non-matching Product results in error', 
		async () => {
		
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [
					{ ...serverComp1 }
				] }));
		
			const name = 'First Component';
		
			expect(Component.getByName(name, 5))
				.rejects
				/* eslint-disable-next-line max-len */
				.toThrowError(`Component "${name}" could not be found for product 5.`);
		});
	
	/* eslint-disable-next-line max-len */
	it('Can get Component by name - multiple matches with non-matching Product results in error', 
		async () => {
		
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [
					{ ...serverComp1 },
					{ ...serverComp3 }
				] }));
		
			const name = 'First Component';
		
			expect(Component.getByName(name, 5))
				.rejects
				/* eslint-disable-next-line max-len */
				.toThrowError(`Component "${name}" could not be found for product 5.`);
		});
	
	it('Can get Component by name - multiple matches filtered by product ID', 
		async () => {
		
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [
					{ ...serverComp1 },
					{ ...serverComp3 }
				] }));
		
			const name = 'First Component';
			const comp = await Component.getByName(name, 2);
		
			expect(comp['serialized']).toEqual(serverComp3base);
		
		});
	
	it('Can get Component by name - multiple matches filtered by Product', 
		async () => {
		
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [
					{ ...serverComp1 },
					{ ...serverComp3 }
				] }));
		
			const name = 'First Component';
			const prod = new Product({ 
				id: 1, 
				name: 'Product A', 
				description: 'First product', 
				classification: 1 
			});
			const comp = await Component.getByName(name, prod);
		
			expect(comp['serialized']).toEqual(serverComp1base);
		
		});
	
});