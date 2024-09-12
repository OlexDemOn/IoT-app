import { Select } from "antd";
import React, { useEffect } from "react";
import type { SelectOptionType } from "../../../types/types";
import useFetchProperties from "../../../hooks/useFetchProperties";

interface SelectPropertiesProps extends React.ComponentProps<typeof Select> {
	machineType: string;
	selectedProperties: string[];
	setSelectedProperties: (value: string[]) => void;
}

export const SelectProperties = ({
	machineType,
	selectedProperties,
	setSelectedProperties,
	className,
	...props
}: SelectPropertiesProps) => {
	const { properties } = useFetchProperties();
	const [options, setOptions] = React.useState<SelectOptionType[]>([]);
	useEffect(() => {
		const index = properties?.findIndex((prop) => prop.machine_type === machineType);

		if (properties) {
			setOptions(generateOptions(properties[index !== undefined ? index : 0].property));
		}
		setSelectedProperties(options.map((option) => option.value));
	}, [setSelectedProperties, properties, machineType, options.map]);

	return (
		<Select
			key={options.map((option) => option.value).join("")}
			mode="multiple"
			style={{ minWidth: "200px" }}
			className={className}
			placeholder="Select machine properties"
			defaultValue={options.map((option) => option.value)}
			options={options}
			optionRender={(option) => <>{option.data.desc}</>}
			{...props}
		/>
	);
};

function generateOptions(properties: string[]) {
	return properties.map((prop) => {
		return {
			label: prop[0].toUpperCase() + prop.slice(1).replace(/_/g, " "),
			value: prop,
			desc: prop[0].toUpperCase() + prop.slice(1).replace(/_/g, " "),
		};
	});
}
