import type { Group, SearchUser } from "../../../types/users";
import { GroupCard } from "../GroupCard";

export function Groupdata(
	group: Group[] | null | undefined,
	handleDelGroup: (group: Group) => void,
	handleEditGroup: (group: Group, line: string) => (event: React.FormEvent<HTMLFormElement>) => void,
	users: SearchUser[] | null | undefined,
	prodLines: { product_line_id: string }[] | null | undefined,
	handleEditFetch: () => void,
) {
	if (group) {
		return group.map((group: Group) => (
			<GroupCard
				group={group}
				key={group.groups_id}
				handleDelGroup={handleDelGroup}
				handleEditGroup={handleEditGroup}
				users={users}
				prodLines={prodLines}
				handleEditFetch={handleEditFetch}
			/>
		));
	}
	return <span className="ml-4 mt-4">The list of groups is empty</span>;
}
