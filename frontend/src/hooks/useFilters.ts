import { useState } from "react";
import type { FilterProps } from "../types/types";

const useFilters = (fetchData: (filters?: FilterProps | undefined) => void) => {
	const [filters, setFilters] = useState<FilterProps>();

	const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilters({ ...filters, [event.target.name]: event.target.value });
	};
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		fetchData(filters);
	};

	const handleClear = () => {
		setFilters({});
		fetchData();
	};

	return { filters, setFilters, handleFilter, handleSubmit, handleClear };
};

export default useFilters;
