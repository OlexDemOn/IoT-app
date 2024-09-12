export type FilterProps = {
	"speed-start"?: number;
	"speed-end"?: number;
	"belt_speed-start"?: number;
	"belt_speed-end"?: number;
	"temperature-end"?: number;
	"temperature-start"?: number;
	"gas_flow-start"?: number;
	"gas_flow-end"?: number;
	"torque-start"?: number;
	"torque-end"?: number;
	"pressure-start"?: number;
	"pressure-end"?: number;
	"elements_ready-start"?: number;
	"elements_ready-end"?: number;
	"power-start"?: number;
	"power-end"?: number;
};

export type PropertiesProps = {
	machine_type: string;
	property: [string];
	measure: [string];
};

export type SelectOptionType = {
	label: string;
	value: string;
	desc: string;
	disabled?: boolean;
};

export type AddFilterProps = {
	options: SelectOptionType[] | undefined;
	activeProperties: string[] | undefined;
	firstValue: string;
	setActiveProperties: React.Dispatch<React.SetStateAction<string[]>>;
};

export type MachineChartProps = {
	id: string;
	timeRange: string;
	selectedProperties: string[];
	dynamicData: boolean;
	machine_type: string;
};

export type ChartOptions = {
	textColor: string;
	data: number[];
	time: Date[];
	chartTitle: string;
};

export type FormItemProps = {
	setActiveProperties: React.Dispatch<React.SetStateAction<string[]>>;
	activeProperties: string[];
};

export type FilterBodyProps = {
	open: boolean;
	properties: PropertiesProps[] | null | undefined;
	fetchData: (filters?: FilterProps) => void;
};
