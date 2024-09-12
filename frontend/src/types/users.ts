export type User = {
	uuid: string;
	name: string;
	group_name: string;
};

export type SearchUser = {
	uuid: string;
	name: string;
	email: string;
	password?: string;
	groups: string[];
};

export type Group = {
	groups_id: string;
	group_name: string;
	product_line_id?: string;
	members_uuid: string[];
};
