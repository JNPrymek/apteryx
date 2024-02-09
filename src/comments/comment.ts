import TimeUtils from '../utils/timeUtils';
import { CommentValues } from './comment.type';

export default class Comment {

	protected serialized: CommentValues;
	
	constructor(serializedValues: CommentValues) {
		this.serialized = serializedValues;
	}

	public getId(): number {
		return this.serialized.id;
	}

	public getComment(): string {
		return this.serialized.comment;
	}

	public getText(): string {
		return this.getComment();
	}

	public isPublic(): boolean {
		return this.serialized.is_public;
	}

	public isRemoved(): boolean {
		return this.serialized.is_removed;
	}

	public getContentId(): number {
		return parseInt(this.serialized.object_pk, 10);
	}

	public getContentTypeId(): number {
		return this.serialized.content_type
			?? this.serialized.content_type_id as number;
	}

	public getContentType(): 'TestCase' | 'TestExecution' {
		if (this.serialized.content_type === 17) return 'TestCase';
		if (this.serialized.content_type_id === 36) return 'TestExecution';
		throw new Error(
			`Unknown commentable content type for comment ${this.getId()}`
		);
	}

	public getDate(): Date {
		return TimeUtils.serverStringToDate(this.serialized.submit_date);
	}

	public getSubmitDate(): Date {
		return this.getDate();
	}

	public getSiteId(): number {
		return this.serialized.site ?? this.serialized.site_id as number;
	}

	public getUserId(): number {
		return this.serialized.user ?? this.serialized.user_id as number;
	}

	public getUserName(): string {
		return this.serialized.user_name;
	}

	public getUserEmail(): string {
		return this.serialized.user_email;
	}

	public toString(): string {
		return `Comment: ${JSON.stringify(this.serialized)}`;
	}
}
