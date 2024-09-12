import { useCallback, useEffect, useState } from "react";
import { getProperties } from "../api/endpoints";
import type { PropertiesProps } from "../types/types";
import { useAuth } from "../components/providers/AuthProvider";

const useFetchProperties = () => {
	const [properties, setProperties] = useState<PropertiesProps[] | null | undefined>();
	const auth = useAuth();
	const fetchData = useCallback(async () => {
		if (!auth.user?.uuid) {
			return;
		}
		const { data } = await getProperties(auth.user?.uuid);
		setProperties(data);
	}, [auth.user?.uuid]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { properties, setProperties, fetchData };
};

export default useFetchProperties;
