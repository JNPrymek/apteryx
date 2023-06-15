import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';
import expectArrayWithKiwiItem from '../../test/expectArrayWithKiwiItem';
import Component from './component';
import Product from './product';
import { 
	mockComponent, 
	mockComponentServerEntry, 
	mockProduct, 
	mockUser
} from '../../test/mockKiwiValues';
import User from './user';
import verifyRpcCall from '../../test/axiosAssertions/verifyRpcCall';

// Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('Component', () => {
	
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	const component1Vals = mockComponent();
	const component2Vals = mockComponent({
		id: 2,
		name: 'Example About page',
		description: 'About page of Example.com',
		initial_owner: 2,
		initial_qa_contact: 1
	});
	const component3Vals = mockComponent({
		id: 3,
		product: 2,
		/* eslint-disable-next-line max-len */
		description: 'First component of the Product 2.  Has same name as a Product1 component'
	});
	
	// Entries returned by RPC API - includes `cases` property
	const component1ServerVals = mockComponentServerEntry(component1Vals);
	const component2ServerVals = mockComponentServerEntry({
		...component2Vals,
		cases: 2
	});
	const component3ServerVals = mockComponentServerEntry(component3Vals);
	
	it('Can instantiate a Component', () => {
		const component1 = new Component(component1ServerVals);
		const component2 = new Component(component2ServerVals);
		const component3 = new Component(component3ServerVals);
		
		expect(component1['serialized']).toEqual(component1Vals);
		expect(component2['serialized']).toEqual(component2Vals);
		expect(component3['serialized']).toEqual(component3Vals);
	});
	
	describe('Local Properties', () => {
		
		const component1 = new Component(component1Vals);
		const component2 = new Component(component2Vals);
		const component3 = new Component(component3Vals);
		
		it('Can get ID of Component', () => {
			expect(component1.getId()).toEqual(1);
			expect(component2.getId()).toEqual(2);
			expect(component3.getId()).toEqual(3);
		});
	
		it('Can get ID of Component Initial Owner', () => {
			expect(component1.getInitialOwnerId()).toEqual(1);
			expect(component2.getInitialOwnerId()).toEqual(2);
			expect(component3.getInitialOwnerId()).toEqual(1);
		});
	
		it('Can get Component Initial Owner', async () => {
			const user1Vals = mockUser();
			const user2Vals = mockUser({
				id: 2,
				username: 'bob',
				email: 'bob@example.com',
				first_name: 'Bob',
				last_name: 'Bar'
			});
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [user1Vals]
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [user2Vals]
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [user1Vals]
			}));
			
			expect(await component1.getInitialOwner())
				.toEqual(new User(user1Vals));
			expect(await component2.getInitialOwner())
				.toEqual(new User(user2Vals));
			expect(await component3.getInitialOwner())
				.toEqual(new User(user1Vals));
		});
	
		it('Can get ID of Component Initial QA Contact', () => {
			expect(component1.getInitialQaContactId()).toEqual(2);
			expect(component2.getInitialQaContactId()).toEqual(1);
			expect(component3.getInitialQaContactId()).toEqual(2);
		});
		
		it('Can get Component Initial QA Contact', async () => {
			const user1Vals = mockUser();
			const user2Vals = mockUser({
				id: 2,
				username: 'bob',
				email: 'bob@example.com',
				first_name: 'Bob',
				last_name: 'Bar'
			});
			
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [user2Vals]
			}));
			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [user1Vals]
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [user2Vals]
			}));
			
			expect(await component1.getInitialQaContact())
				.toEqual(new User(user2Vals));
			expect(await component2.getInitialQaContact())
				.toEqual(new User(user1Vals));
			expect(await component3.getInitialQaContact())
				.toEqual(new User(user2Vals));
		});
	
		it('Can get ID of Component Product', () => {
			expect(component1.getProductId()).toEqual(1);
			expect(component2.getProductId()).toEqual(1);
			expect(component3.getProductId()).toEqual(2);
		});
	
		it('Can get Component Product', async () => {
			const product1Vals = mockProduct();
		
			mockAxios.post.mockResolvedValue(mockRpcResponse(
				{ result: [ product1Vals ] }
			));
		
			const compProd = await component1.getProduct();
		
			expect(compProd['serialized']).toEqual(product1Vals);
		});
	
		it('Can get Component description', () => {
			expect(component1.getDescription())
				.toEqual('Homepage of the Example.com website');
			expect(component2.getDescription())
				.toEqual('About page of Example.com');
			expect(component3.getDescription())
				/* eslint-disable-next-line max-len */
				.toEqual('First component of the Product 2.  Has same name as a Product1 component');
		});
	
		it('Can get Component name', () => {
			expect(component1.getName()).toEqual('Example Homepage');
			expect(component2.getName()).toEqual('Example About page');
			expect(component3.getName()).toEqual('Example Homepage');
		});
	
		it('Can get IDs of TestCases linked to Component', async () => {
			// Mock distinct entries
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [ 
					{ ...component1Vals, cases: 1 },
					{ ...component1Vals, cases: 2 },
					{ ...component1Vals, cases: 5 }
				] }));
			const compTCs = await component1.getLinkedTestCaseIds();
			expect(compTCs).toEqual([1, 2, 5]);
		});
	});
	
	describe('Server Lookups', () => {
		it('Can get by single ID - 0 TCs linked', async () => {
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ 
						result: [ component1ServerVals ] 
					}));
			
			const comp = await Component.getById(1);
			expect(comp['serialized']).toEqual(component1Vals);
		});
		
		it('Can get by single ID - 1 TC linked', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [component2ServerVals] }));
			
			const comp = await Component.getById(2);
			expect(comp['serialized']).toEqual(component2Vals);
		});
		
		it('Can get by single ID - 2 TCs linked', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [ 
					{ ...component1ServerVals, cases: 1 },
					{ ...component1ServerVals, cases: 2 }
				] }));
			
			const comp = await Component.getById(1);
			expect(comp['serialized']).toEqual(component1Vals);
			
		});
		
		it('Can get by multiple IDs - mix of TCs linked', async () => {
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [ 
					{ ...component1ServerVals, cases: 1 },
					{ ...component1ServerVals, cases: 2 },
					component3ServerVals
				] }));
			
			const comps = await Component.getByIds([1, 3]);
			
			expectArrayWithKiwiItem(comps, component1Vals);
			expectArrayWithKiwiItem(comps, component3Vals);
		});
		
		it('Can get Component by name - 0 matches', async () => {
		
			mockAxios.post.mockResolvedValue(
				mockRpcResponse({ result: [] }));
		
			expect(Component.getByName('First Component'))
				.rejects
				/* eslint-disable-next-line max-len */
				.toThrowError('Component "First Component" could not be found.');
		});
		
		it('Can get Component by name - 1 matches', async () => {
		
			mockAxios.post.mockResolvedValue(mockRpcResponse(
				{ result: [component1ServerVals] }
			));
			
			const comp = await Component.getByName('Example Homepage');
			
			expect(comp['serialized']).toEqual(component1Vals);
			
		});
		
		/* eslint-disable-next-line max-len */
		it('Can get Component by name - multiple matches without product filter throws Error', 
			async () => {
			
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [ component1ServerVals, component3ServerVals] }
				));
			
				const name = 'Example Homepage';
				expect(Component.getByName(name))
					.rejects
					/* eslint-disable-next-line max-len */
					.toThrowError(`Component '${name}' exists for multiple products.  The 'product' param must be specified`);
			});
		
		/* eslint-disable-next-line max-len */
		it('Can get Component by name - single match with non-matching Product results in error', 
			async () => {
			
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [component1ServerVals] }
				));
			
				const name = 'Example Homepage';
			
				expect(Component.getByName(name, 5))
					.rejects
					/* eslint-disable-next-line max-len */
					.toThrowError(`Component "${name}" could not be found for product 5.`);
			});
		
		/* eslint-disable-next-line max-len */
		it('Can get Component by name - multiple matches with non-matching Product results in error', 
			async () => {
			
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [ component1ServerVals, component3ServerVals] }
				));
			
				const name = 'Example Homepage';
			
				expect(Component.getByName(name, 5))
					.rejects
					/* eslint-disable-next-line max-len */
					.toThrowError(`Component "${name}" could not be found for product 5.`);
			});
		
		/* eslint-disable-next-line max-len */
		it('Can get Component by name - multiple matches filtered by product ID', 
			async () => {
			
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [component1ServerVals, component3ServerVals] }
				));
			
				const name = 'Example Homepage';
				const comp = await Component.getByName(name, 2);
			
				expect(comp['serialized']).toEqual(component3Vals);
			
			});
		
		it('Can get Component by name - multiple matches filtered by Product', 
			async () => {
			
				mockAxios.post.mockResolvedValue(mockRpcResponse(
					{ result: [component1ServerVals, component3ServerVals] }
				));
			
				const name = 'Example Homepage';
				const prod = new Product(mockProduct());
				const comp = await Component.getByName(name, prod);
			
				expect(comp['serialized']).toEqual(component1Vals);
			
			});
		
		it('Can get Component list for given TestCase ID', async () => {
			const tcId = 3;
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [
					mockComponentServerEntry({ name: 'Comp1', cases: tcId }),
					mockComponentServerEntry(
						{ id: 8, name: 'Comp8', cases: tcId }
					),
					mockComponentServerEntry(
						{ id: 14, name: 'Comp14', cases: tcId }
					),
				]
			}));

			const compoents = await Component.getComponentsForTestCase(tcId);
			verifyRpcCall(
				mockAxios,
				0,
				'Component.filter',
				[ { cases: tcId }]
			);

			expect(compoents)
				.toContainEqual(new Component(
					mockComponent({ id: 1, name: 'Comp1' })
				));
			expect(compoents)
				.toContainEqual(new Component(
					mockComponent({ id: 8, name: 'Comp8' })
				));
			expect(compoents)
				.toContainEqual(new Component(
					mockComponent({ id: 14, name: 'Comp14' })
				));
		});

		it('Can reload values from server', async () => {
			const origServerVal = mockComponentServerEntry();
			const origLocalVal = mockComponent();
			const updatedVal = mockComponent({
				name: 'New and improved',
				description: 'Updated for unit testing'
			});
			const updatedServerVal = [
				mockComponentServerEntry(updatedVal),
				mockComponentServerEntry({
					...updatedVal,
					cases: 1
				}),
				mockComponentServerEntry({
					...updatedVal,
					cases: 2
				}),
				mockComponentServerEntry({
					...updatedVal,
					cases: 3
				}),
			];

			mockAxios.post.mockResolvedValueOnce(mockRpcResponse({
				result: [ origServerVal ]
			}));
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: updatedServerVal
			}));

			const comp1 = await Component.getById(1);
			expect(comp1['serialized']).toEqual(origLocalVal);
			await comp1.syncServerValues();
			verifyRpcCall(mockAxios, 1, 'Component.filter', [{ id: 1 }]);
			expect(comp1['serialized']).toEqual(updatedVal);
		});
	});
});