import axios from 'axios';
import mockRpcResponse from '../../test/axiosAssertions/mockRpcResponse';

import TestCase from './testCase';
import Priority from '../management/priority';
import Category from './category';
import TestCaseStatus from './testCaseStatus';

// Init Mock Axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('TestCase', () => {
	
	const case1Vals = {
		id: 1,
		create_date: '2021-01-02T03:15:00.000',  // 3:15am Jan 3rd 2021 (UTC)
		is_automated: false,
		script: 'Sample script or an empty string',
		arguments: 'Sample args or an empty string',
		extra_link: 'Sample text or an empty string',
		summary: 'Sample Test Case Title',
		requirement: null,
		notes: 'Notes or empty string',
		text: 'Sample Test Case Details',
		case_status: 1,
		case_status__name: 'PROPOSED',
		category: 4,
		category__name: 'Regression',
		priority: 1,
		priority__value: 'P1',
		setup_duration: 2700.0,
		testing_duration: 60.0,
		expected_duration: 2760.0,
		author: 1,
		author__username: 'jsmith',
		default_tester: null,
		default_tester__username: null,
		reviewer: null,
		reviewer__username: null
	};
	
	const case2Vals = { 
		...case1Vals,
		id: 2,
		default_tester: 2,
		default_tester__username: 'bob',
		reviewer: 3,
		reviewer__username: 'anne',
		is_automated: true,
		setup_duration: 0.0,
		testing_duration: 325.0,
		expected_duration: 325.0
	};
		
	const tc1 = new TestCase(case1Vals);
	const tc2 = new TestCase(case2Vals);
	
	it('Can instantiate a TestCase', () => {
		const tc1 = new TestCase(case1Vals);
		expect(tc1['serialized']).toEqual(case1Vals);
	});
	
	describe('Can access local properties of TestCase', () => {
		
		it('Can get TC ID', () => {
			expect(tc1.getId()).toEqual(1);
			expect(tc2.getId()).toEqual(2);
		});
		
		it('Can get TC Create Date', () => {
			const date = new Date('2021-01-02T03:15:00.000Z');
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
		});
		
		it('Can get TC Arguments', () => {
			expect(tc1.getArguments())
				.toEqual('Sample args or an empty string');
		});
		
		it('Can get TC Requirements', () => {
			expect(tc1.getRequirements()).toBeNull();
		});
		
		it('Can get TC Reference Link', () => {
			expect(tc1.getExtraLink())
				.toEqual('Sample text or an empty string');
		});
		
		it('Can get TC Reference Link', () => {
			expect(tc1.getReferenceLink())
				.toEqual('Sample text or an empty string');
		});
		
		it('Can get TC Summary', () => {
			expect(tc1.getSummary()).toEqual('Sample Test Case Title');
		});
		
		it('Can get TC Title', () => {
			expect(tc1.getTitle()).toEqual('Sample Test Case Title');
		});
		
		it('Can get TC Text', () => {
			expect(tc1.getText()).toEqual('Sample Test Case Details');
		});
		
		it('Can get TC Notes', () => {
			expect(tc1.getNotes()).toEqual('Notes or empty string');
		});

		it('Can get TC Status', async () => {
			const tcStatusVals = {
				id: 1,
				name: 'PROPOSED',
				description: 'Unreviewed, new test cases',
				'is_confirmed': false
			};
			const proposedStatus = new TestCaseStatus(tcStatusVals);

			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [tcStatusVals] })
				);
			const tc1Status = await tc1.getCaseStatus();
			expect(tc1Status).toEqual(proposedStatus);
		});
		
		it('Can get TC Status ID', () => {
			expect(tc1.getCaseStatusId()).toEqual(1);
		});
		
		it('Can get TC Status Name', () => {
			expect(tc1.getCaseStatusName()).toEqual('PROPOSED');
		});
		
		it('Can get TC Category ID', () => {
			expect(tc1.getCategoryId()).toEqual(4);
		});
		
		it('Can get TC Category Name', () => {
			expect(tc1.getCategoryName()).toEqual('Regression');
		});

		it('Can get TC Category', async () => {
			const regressionCategoryVals = {
				id: 4,
				name: 'Regression',
				product: 1,
				'product_name': 'Example.com Website'
			};
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [regressionCategoryVals] })
				);
			const regressionCategory = await tc1.getCategory();
			expect(regressionCategory)
				.toEqual(new Category(regressionCategoryVals));
		});
		
		it('Can get TC Priority', async () => {
			const priorityOneVals = { id: 1, value: 'P1', is_active: true };
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [priorityOneVals] })
				);
			const tcPriority = await tc1.getPriority();
			expect(tcPriority).toEqual(new Priority(priorityOneVals));
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
			expect(tc1.getAuthorName()).toEqual('jsmith');
			expect(tc2.getAuthorName()).toEqual('jsmith');
		});
		
		it('Can get TC Reviewer ID', () => {
			expect(tc1.getReviewerId()).toBeNull();
			expect(tc2.getReviewerId()).toEqual(3);
		});
		
		it('Can get TC Reviewer Username', () => {
			expect(tc1.getReviewerName()).toBeNull();
			expect(tc2.getReviewerName()).toEqual('anne');
		});
		
		it('Can get TC Default Tester ID', () => {
			expect(tc1.getDefaultTesterId()).toBeNull();
			expect(tc2.getDefaultTesterId()).toEqual(2);
		});
		
		it('Can get TC Default Tester Username', () => {
			expect(tc1.getDefaultTesterName()).toBeNull();
			expect(tc2.getDefaultTesterName()).toEqual('bob');
		});

		it('Can get TC Setup Duration', () => {
			expect(tc1.getSetupDuration()).toEqual(2700.0);
			expect(tc2.getSetupDuration()).toEqual(0.0);
		});

		it('Can get TC Testing Duration', () => {
			expect(tc1.getTestingDuration()).toEqual(60.0);
			expect(tc2.getTestingDuration()).toEqual(325.0);
		});

		it('Can get TC Total Expected Duration', () => {
			expect(tc1.getTotalDuration()).toEqual(2760.0);
			expect(tc2.getTotalDuration()).toEqual(325.0);
		});
		
	});
	
	describe('Basic Server Functions', () => {
		
		it('Can get TC by a single ID (one match)', async () => {
			mockAxios
				.post
				.mockResolvedValue(
					mockRpcResponse({ result: [case1Vals] })
				);
			const testCaseOne = await TestCase.getById(1);
			expect(testCaseOne).toEqual(tc1);
		});
		
		it('Can get TC by a single ID (no match)', async () => {
			mockAxios.post.mockResolvedValue(mockRpcResponse({ result: [] }));
			expect(TestCase.getById(1))
				.rejects
				.toThrowError('Could not find any TestCase with ID 1');
		});
	});
});
