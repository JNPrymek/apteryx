import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

import TestCase from './testCase';
import Priority from '../management/priority';
import Category from './category';
import TestCaseStatus from './testCaseStatus';
import { 
	mockPriority, 
	mockTestCase, 
	mockTestCaseStatus 
} from '../../test/mockKiwiValues';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('TestCase', () => {
	
	const case1Vals = mockTestCase();
	const case2Vals = mockTestCase({
		id: 2,
		summary: 'Another test case',
		extra_link: 'Sample text or an empty string',
		script: '',
		default_tester: null,
		default_tester__username: null,
		reviewer: 3,
		reviewer__username: 'charles',
		is_automated: true,
		setup_duration: 0.0,
		testing_duration: 325.0,
		expected_duration: 325.0
	});
		
	
	it('Can instantiate a TestCase', () => {
		const tc1 = new TestCase(case1Vals);
		expect(tc1['serialized']).toEqual(case1Vals);
	});
	
	describe('Can access local properties of TestCase', () => {
		
		const tc1 = new TestCase(case1Vals);
		const tc2 = new TestCase(case2Vals);
	
		it('Can get TC ID', () => {
			expect(tc1.getId()).toEqual(1);
			expect(tc2.getId()).toEqual(2);
		});
		
		it('Can get TC Create Date', () => {
			const date = new Date('2022-12-02T20:13:27.697Z');
			expect(tc1.getCreateDate()).toEqual(date);
		});
		
		it('Can get TC Automation (automated)', () => {
			expect(tc1.isAutomated()).toEqual(false);
			expect(tc2.isAutomated()).toEqual(true);
		});
		
		it('Can get TC Automation (manual)', () => {
			expect(tc1.isManual()).toEqual(true);
			expect(tc2.isManual()).toEqual(false);
		});
		
		it('Can get TC Script', () => {
			expect(tc1.getScript()).toEqual('Sample script or an empty string');
			expect(tc2.getScript()).toEqual('');
		});
		
		it('Can get TC Arguments', () => {
			expect(tc1.getArguments())
				.toEqual('Sample args or an empty string');
		});
		
		it('Can get TC Requirements', () => {
			expect(tc1.getRequirements()).toBeNull();
		});
		
		it('Can get TC Reference Link', () => {
			expect(tc1.getReferenceLink()).toBeNull();
			expect(tc2.getExtraLink())
				.toEqual('Sample text or an empty string');
		});
		
		it('Can get TC Reference Link', () => {
			expect(tc1.getReferenceLink()).toBeNull();
			expect(tc2.getReferenceLink())
				.toEqual('Sample text or an empty string');
		});
		
		it('Can get TC Summary', () => {
			expect(tc1.getSummary()).toEqual('Example Test Case Title');
			expect(tc2.getSummary()).toEqual('Another test case');
		});
		
		it('Can get TC Title', () => {
			expect(tc1.getTitle()).toEqual('Example Test Case Title');
			expect(tc2.getTitle()).toEqual('Another test case');
		});
		
		it('Can get TC Text', () => {
			expect(tc1.getText())
				.toEqual('An example test case for unit testing');
		});
		
		it('Can get TC Notes', () => {
			expect(tc1.getNotes()).toEqual('Custom notes go here');
		});

		it('Can get TC Status', async () => {
			const tcStatus2Vals = mockTestCaseStatus({
				id: 2,
				name: 'CONFIRMED',
				is_confirmed: true,
				description: 'Tests that are ready to go'
			});
			const confirmedStatus = new TestCaseStatus(tcStatus2Vals);

			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [tcStatus2Vals]
			}));
			const tc1Status = await tc1.getCaseStatus();
			expect(tc1Status).toEqual(confirmedStatus);
		});
		
		it('Can get TC Status ID', () => {
			expect(tc1.getCaseStatusId()).toEqual(2);
		});
		
		it('Can get TC Status Name', () => {
			expect(tc1.getCaseStatusName()).toEqual('CONFIRMED');
		});
		
		it('Can get TC Category ID', () => {
			expect(tc1.getCategoryId()).toEqual(4);
		});
		
		it('Can get TC Category Name', () => {
			expect(tc1.getCategoryName()).toEqual('Regression');
		});

		it('Can get TC Category', async () => {
			const regressionCategoryVals = mockTestCaseStatus({
				id: 4,
				name: 'Regression'
			});
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [regressionCategoryVals]
			}));
			const regressionCategory = await tc1.getCategory();
			expect(regressionCategory)
				.toEqual(new Category(regressionCategoryVals));
		});
		
		it('Can get TC Priority', async () => {
			const priority1Vals = mockPriority();
			mockAxios.post.mockResolvedValue(mockRpcResponse({
				result: [priority1Vals]
			}));
			const tcPriority = await tc1.getPriority();
			expect(tcPriority).toEqual(new Priority(priority1Vals));
		});
		
		it('Can get TC Priority ID', () => {
			expect(tc1.getPriorityId()).toEqual(1);
		});
		
		it('Can get TC Priority Value', () => {
			expect(tc1.getPriorityValue()).toEqual('P1');
		});
		
		it('Can get TC Author ID', () => {
			expect(tc1.getAuthorId()).toEqual(1);
			expect(tc2.getAuthorId()).toEqual(1);
		});
		
		it('Can get TC Author Username', () => {
			expect(tc1.getAuthorName()).toEqual('alice');
			expect(tc2.getAuthorName()).toEqual('alice');
		});
		
		it('Can get TC Reviewer ID', () => {
			expect(tc1.getReviewerId()).toEqual(2);
			expect(tc2.getReviewerId()).toEqual(3);
		});
		
		it('Can get TC Reviewer Username', () => {
			expect(tc1.getReviewerName()).toEqual('bob');
			expect(tc2.getReviewerName()).toEqual('charles');
		});
		
		it('Can get TC Default Tester ID', () => {
			expect(tc1.getDefaultTesterId()).toEqual(1);
			expect(tc2.getDefaultTesterId()).toBeNull();
		});
		
		it('Can get TC Default Tester Username', () => {
			expect(tc1.getDefaultTesterName()).toEqual('alice');
			expect(tc2.getDefaultTesterName()).toBeNull();
		});

		it('Can get TC Setup Duration', () => {
			expect(tc1.getSetupDuration()).toEqual(60.0);
			expect(tc2.getSetupDuration()).toEqual(0.0);
		});

		it('Can get TC Testing Duration', () => {
			expect(tc1.getTestingDuration()).toEqual(30.0);
			expect(tc2.getTestingDuration()).toEqual(325.0);
		});

		it('Can get TC Total Expected Duration', () => {
			expect(tc1.getTotalDuration()).toEqual(90.0);
			expect(tc2.getTotalDuration()).toEqual(325.0);
		});
		
	});
	
	describe('Basic Server Functions', () => {
		
		it('Can get TC by a single ID (one match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ 
				result: [case1Vals] 
			}));
			const testCaseOne = await TestCase.getById(1);
			expect(testCaseOne).toEqual(new TestCase(case1Vals));
		});
		
		it('Can get TC by a single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			expect(TestCase.getById(1))
				.rejects
				.toThrowError('Could not find any TestCase with ID 1');
		});
	});
});
