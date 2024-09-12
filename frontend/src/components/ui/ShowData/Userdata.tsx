import { useMemo } from "react";
import type { SearchUser } from "../../../types/users";
import { UserCard } from "../UserCard";

export function Userdata(
	users: SearchUser[] | null | undefined,
	namefilter: RegExp,
	groupfilter: string,
	handleDelUser: (user: SearchUser) => void,
	handleEditUser: (user: SearchUser) => (event: React.FormEvent<HTMLFormElement>) => void,
) {
	const filtered = useMemo(() => {
		return users
			? users
					.filter((user: SearchUser) => namefilter.exec(user.name))
					.filter((user: SearchUser) => {
						if (groupfilter.length !== 0) {
							return user.groups.some((r) => groupfilter.includes(r));
						}
						return true;
					})
			: [];
	}, [users, namefilter, groupfilter]);

	if (filtered.length !== 0) {
		return filtered.map((user: SearchUser) => (
			<UserCard user={user} key={user.uuid} handleDelUser={handleDelUser} handleEditUser={handleEditUser} />
		));
	}
	return <span className="ml-4 mt-4">The list of users is empty</span>;
}
