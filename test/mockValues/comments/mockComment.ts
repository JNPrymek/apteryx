
import { CommentValues } from '../../../src/comments/comment.type';

import CommentTestCaseDefault from './comment_testCase.json';
export function mockTestCaseComment(
	overrideValues?: Partial<CommentValues>
): CommentValues {
	return {
		...CommentTestCaseDefault,
		...overrideValues,
	};
}

import CommentTestExeDefault from './comment_testExecution.json';
export function mockTestExecutionComment(
	overrideValues?: Partial<CommentValues>
): CommentValues {
	return {
		...CommentTestExeDefault,
		...overrideValues,
	};
}
