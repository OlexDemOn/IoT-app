import { useEffect, useState } from "react";
import { useAuth } from "../components/providers/AuthProvider";
import type { Group } from "../types/users";
import { getGroups } from "../api/endpoints";

function useFetchGroup() {
	const [group, setGroup] = useState<Group[] | null | undefined>(null);
	const auth = useAuth();

	useEffect(() => {
		fetchGroupData();
	}, []);

	const fetchGroupData = async () => {
		if (auth.user?.uuid) {
			const { data } = await getGroups(auth.user.uuid, undefined);
			data?.sort((a, b) => b.members_uuid.length - a.members_uuid.length);
			setGroup(data);
		}
	};

	return { group, fetchGroupData, setGroup };
}

export default useFetchGroup;
