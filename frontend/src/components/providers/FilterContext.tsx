// FilterContext.tsx
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { FilterProps, PropertiesProps, SelectOptionType } from "../../types/types";

type FilterContextProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	options: SelectOptionType[] | undefined;
	setOptions: (options: SelectOptionType[] | undefined) => void;
	currentSelectProperty: string;
	setCurrentSelectProperty: (currentSelectProperty: string) => void;
	activeFilters: string[] | undefined;
	setActiveFilters: (activeFilters: string[] | undefined) => void;
	fetchData: (filters?: FilterProps) => void;
};

const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export const useFilterContext = () => {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilterContext must be used within a FilterProvider");
	}
	return context;
};

type FilterProviderProps = {
	properties: PropertiesProps[] | null | undefined;
	fetchData: (filters?: FilterProps) => void;
	children: React.ReactNode;
};

export const FilterProvider: React.FC<FilterProviderProps> = ({ properties, children, fetchData }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [options, setOptions] = useState<SelectOptionType[] | undefined>([]);
	const [currentSelectProperty, setCurrentSelectProperty] = useState<string>("");
	const [activeFilters, setActiveFilters] = useState<string[] | undefined>();

	useEffect(() => {
		const allProperties = new Set();
		if (properties) {
			for (const obj of properties) {
				for (const prop of obj.property) {
					allProperties.add(prop);
				}
			}
		}
		const temp = Array.from(allProperties) as string[];
		setOptions(
			temp?.map((prop, index) => {
				return {
					label: prop[0].toUpperCase() + prop.slice(1).replace(/_/g, " "),
					value: prop,
					desc: prop[0].toUpperCase() + prop.slice(1).replace(/_/g, " "),
					disabled: !index,
				};
			}),
		);
		setCurrentSelectProperty(temp?.[0] || "");
		setActiveFilters(temp?.[0] ? [temp?.[0]] : undefined);
	}, [properties]);

	return (
		<FilterContext.Provider
			value={{
				open,
				setOpen,
				options,
				setOptions,
				currentSelectProperty,
				setCurrentSelectProperty,
				activeFilters,
				setActiveFilters,
				fetchData,
			}}
		>
			{children}
		</FilterContext.Provider>
	);
};
