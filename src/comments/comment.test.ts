import { describe, it, expect } from '@jest/globals';

import Comment from './comment';
import {
	mockTestCaseComment,
	mockTestExecutionComment
} from '../../test/mockValues/comments/mockComment';
import TimeUtils from '../utils/timeUtils';

describe('Comment', () => {
	// Clear mock calls between tests - required to verify RPC calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const comment1Vals = mockTestCaseComment();
	const comment2Vals = mockTestExecutionComment({
		id: 2,
		object_pk: '3',
	});

	it('Can instantiate a Comment', () => {
		const comment1 = new Comment(comment1Vals);
		expect(comment1['serialized']).toEqual(comment1Vals);
		const comment2 = new Comment(comment2Vals);
		expect(comment2['serialized']).toEqual(comment2Vals);
	});

	describe('Can access local properties', () => {
		const comment1 = new Comment(comment1Vals);
		const comment2 = new Comment(comment2Vals);

		it('Can get Comment ID', () => {
			expect(comment1.getId()).toEqual(1);
			expect(comment2.getId()).toEqual(2);
		});

		it('Can get Comment Type', () => {
			expect(comment1.getContentType()).toEqual('TestCase');
			expect(comment2.getContentType()).toEqual('TestExecution');
		});

		it('Can get Comment Type ID', () => {
			expect(comment1.getContentTypeId()).toEqual(17);
			expect(comment2.getContentTypeId()).toEqual(36);
		});

		it('Can get Commented Item ID', () => {
			expect(comment1.getContentId()).toEqual(1);
			expect(comment2.getContentId()).toEqual(3);
		});

		it('Can get Comment Text', () => {
			expect(comment1.getText())
				.toEqual('Comment on a TestCase that is not runnable');
			expect(comment2.getText()).toEqual('Comment on the test execution');
		});

		it('Can get Comment value', () => {
			expect(comment1.getComment())
				.toEqual('Comment on a TestCase that is not runnable');
			expect(comment2.getComment())
				.toEqual('Comment on the test execution');
		});

		it('Can get Comment creation date', () => {
			const date1 = TimeUtils
				.serverStringToDate('2023-12-15T19:51:49.000');
			const date2 = TimeUtils
				.serverStringToDate('2023-12-15T19:55:09.000');
			expect(comment1.getDate()).toEqual(date1);
			expect(comment2.getDate()).toEqual(date2);
		});

		it('Can get Comment submission date', () => {
			const date1 = TimeUtils
				.serverStringToDate('2023-12-15T19:51:49.000');
			const date2 = TimeUtils
				.serverStringToDate('2023-12-15T19:55:09.000');
			expect(comment1.getSubmitDate()).toEqual(date1);
			expect(comment2.getSubmitDate()).toEqual(date2);
		});

		it('Can get Comment isPublic', () => {
			expect(comment1.isPublic()).toEqual(true);
			expect(comment2.isPublic()).toEqual(true);
		});

		it('Can get Comment isRemoved', () => {
			expect(comment1.isRemoved()).toEqual(false);
			expect(comment2.isRemoved()).toEqual(false);
		});

		it('Can get Comment content type', () => {
			expect(comment1.getContentType()).toEqual('TestCase');
			expect(comment2.getContentType()).toEqual('TestExecution');
		});

		it('Throws error for invalid Comment content type', async () => {
			const invalidCommentValues = mockTestCaseComment({
				content_type: 2,
				id: 3,
			});
			const invalidComment = new Comment(invalidCommentValues);
			console.log(JSON.stringify(invalidComment));
			// Calling expect(invalidComment.getContentType).toThrowError...
			// Does not catch error
			expect(() => {
				invalidComment.getContentType();
			}).toThrowError('Unknown commentable content type for comment 3');
		});

		it('Can get Comment Site ID', () => {
			expect(comment1.getSiteId()).toEqual(1);
			expect(comment2.getSiteId()).toEqual(1);
		});

		it('Can get Comment User ID', () => {
			expect(comment1.getUserId()).toEqual(1);
			expect(comment2.getUserId()).toEqual(1);
		});

		it('Can get Comment User Name', () => {
			expect(comment1.getUserName()).toEqual('alice');
			expect(comment2.getUserName()).toEqual('alice');
		});

		it('Can get Comment User Email', () => {
			expect(comment1.getUserEmail()).toEqual('alice@example.com');
			expect(comment2.getUserEmail()).toEqual('alice@example.com');
		});

		it('Can get string representation of Comment object', () => {
			expect(comment1.toString()).toEqual(
				`Comment: ${JSON.stringify(comment1Vals)}`
			);
		});
	});
});
