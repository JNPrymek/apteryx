import axios from 'axios';

import KiwiConnector from '../core/kiwiConnector';

import { serverDomain } from '../../test/testServerDetails';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import Component from './component';
import Product from './product';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Component', () => {
	
	KiwiConnector.init({ hostName: serverDomain });
	
	//  Base values (without 'cases') of Components
	const serverComp1base = {
		id: 1,
		name: 'First Component',
		product: 1,
		'initial_owner': 1,
		'initial_qa_contact': 2,
		description: 'The first component added to Kiwi'
	};
	
	const serverComp2base = {
		id: 2,
		name: 'Second Component',
		product: 1,
		'initial_owner': 2,
		'initial_qa_contact': 1,
		description: 'The second component added to Kiwi'
	};
	
	const serverComp3base = {
		id: 3,
		name: 'First Component',
		product: 2,
		'initial_owner': 1,
		'initial_qa_contact': 2,
		description: 'First Component of Prod2.  Happens to have a duplicate name as an existing component in Prod1.'
	};
	
	it('Can get by single ID - 0 TCs linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({result: [ { ...serverComp1base, cases: null }]}));
		
		const comp = await Component.getById(1);
		expect(comp['serialized']).toEqual(serverComp1base);
	});
	
	it('Can get by single ID - 1 TC linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({result: [ { ...serverComp1base, cases: 1 }]}));
		
		const comp = await Component.getById(1);
		expect(comp['serialized']).toEqual(serverComp1base);
	});
	
	it('Can get by single ID - 2 TCs linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({result: [ 
				{ ...serverComp1base, cases: 1 },
				{ ...serverComp1base, cases: 2 }
			]}));
		
		const comp = await Component.getById(1);
		expect(comp['serialized']).toEqual(serverComp1base);
		
	});
	
	it('Can get by multiple IDs - mix of TCs linked', async () => {
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({result: [ 
				{ ...serverComp1base, cases: 1 },
				{ ...serverComp1base, cases: 2 },
				{ ...serverComp2base, cases: null }
			]}));
		
		const comps = await Component.getByIds([1,2]);
		
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
		
		mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [ serverProd1 ] }));
		
		const comp = new Component(serverComp1base);
		const compProd = await comp.getProduct();
		
		expect(compProd['serialized']).toEqual(serverProd1);
	});
	
	it('Can get Component description', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getDescription()).toEqual('The first component added to Kiwi');
	});
	
	it('Can get Component name', () => {
		const comp = new Component(serverComp1base);
		expect(comp.getName()).toEqual('First Component');
	});
	
	it('Can get IDs of TestCases linked to Component', async () => {
		const comp = new Component(serverComp1base);
		
		// Mock distinct entries
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({result: [ 
				{ ...serverComp1base, cases: 1 },
				{ ...serverComp1base, cases: 2 },
				{ ...serverComp1base, cases: 5 }
			]}));
		
		const compTCs = await comp.getLinkedTestCaseIds();
		
		expect(compTCs).toEqual([1, 2, 5]);
	});
	
	it('Can get Component by name - 0 matches', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [] }));
		
		expect(Component.getByName('First Component'))
			.rejects.toThrowError('Component "First Component" could not be found.');
	});
	
	it('Can get Component by name - 1 matches', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1base, cases: null }
			] }));
		
		const comp = await Component.getByName('First Component');
		
		expect(comp['serialized']).toEqual(serverComp1base);
		
	});
	
	it('Can get Component by name - multiple matches without product filter throws Error', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1base, cases: null },
				{ ...serverComp3base, cases: null }
			] }));
		
		const name = 'First Component';
		expect(Component.getByName(name))
			.rejects.toThrowError(`Component '${name}' exists for multiple products.  The 'product' param must be specified`);
	});
	
	it('Can get Component by name - single match with non-matching Product results in error', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1base, cases: null }
			] }));
		
		const name = 'First Component';
		
		expect(Component.getByName(name, 5))
			.rejects.toThrowError(`Component "${name}" could not be found for product 5.`);
	});
	
	it('Can get Component by name - multiple matches with non-matching Product results in error', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1base, cases: null },
				{ ...serverComp3base, cases: null }
			] }));
		
		const name = 'First Component';
		
		expect(Component.getByName(name, 5))
			.rejects.toThrowError(`Component "${name}" could not be found for product 5.`);
	});
	
	it('Can get Component by name - multiple matches filtered by product ID', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1base, cases: null },
				{ ...serverComp3base, cases: null }
			] }));
		
		const name = 'First Component';
		const comp = await Component.getByName(name, 2);
		
		expect(comp['serialized']).toEqual(serverComp3base);
		
	});
	
	it('Can get Component by name - multiple matches filtered by Product', async () => {
		
		mockAxios.post.mockResolvedValue(
			mockRpcResponse({ result: [
				{ ...serverComp1base, cases: null },
				{ ...serverComp3base, cases: null }
			] }));
		
		const name = 'First Component';
		const prod = new Product({id: 1, name: 'Product A', description: 'First product', classification: 1});
		const comp = await Component.getByName(name, prod);
		
		expect(comp['serialized']).toEqual(serverComp1base);
		
	});
	
});