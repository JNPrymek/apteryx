
export type CommentValues = {
	id: number;
	content_type?: number; // Used by TC comment
	content_type_id?: number; // Used by TE comment
	object_pk: string;
	site?: number; // Used by TC comment
	site_id?: number; // Used by TE comment
	user?: number; // Used by TC comment
	user_id?: number; // Used by TE comment
	user_name: string;
	user_email: string;
	user_url: string;
	comment: string;
	submit_date: string;
	ip_address: string | null;
	is_public: boolean;
	is_removed: boolean;
};
