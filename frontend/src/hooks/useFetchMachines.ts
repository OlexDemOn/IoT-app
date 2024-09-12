import { useEffect, useState, useCallback } from "react";
import { getAllMachine } from "../api/endpoints";
import { useAuth } from "../components/providers/AuthProvider";
import type { FilterProps } from "../types/types";
import type { MachineProps } from "../types/machines";

const useFetchMachines = () => {
	const [machines, setMachines] = useState<MachineProps[] | null | undefined>();
	const auth = useAuth();

	const fetchData = useCallback(
		async (initialFilters?: FilterProps) => {
			if (auth.user?.uuid) {
				const { data } = await getAllMachine(auth.user.uuid, initialFilters);
				setMachines(data);
			}
		},
		[auth.user?.uuid],
	);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { machines, fetchData, setMachines };
};

export default useFetchMachines;
