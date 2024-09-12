import { useEffect, useState } from "react";
import type { SearchUser } from "../types/users";
import { useAuth } from "../components/providers/AuthProvider";
import { getUsers } from "../api/endpoints";

function useFetchUser() {
	const [users, setUsers] = useState<SearchUser[] | null | undefined>(null);
	const auth = useAuth();

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		if (auth.user?.uuid) {
			const { data } = await getUsers(auth.user.uuid, undefined);
			data?.sort((a, b) =>
				a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()
					? 1
					: b.name.toLocaleLowerCase() > a.name.toLocaleLowerCase()
						? -1
						: 0,
			);
			setUsers(data);
		}
	};

	return { users, fetchUserData, setUsers };
}

export default useFetchUser;
