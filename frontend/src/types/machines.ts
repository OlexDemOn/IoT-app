import type { Select } from "antd";

export type MachineProps = {
	machine_id: string;
	machine_type: string;
	speed: number;
	belt_speed: number;
	temperature: number;
	gas_flow: number;
	torque: number;
	pressure: number;
	elements_ready: number;
	power: number;
	created_at: string;
};

export type MachineWithAvgProps = {
	data: MachineProps[];
	avarage: number;
	max: number;
	min: number;
};

export const MachineTypes = ["soldering", "drilling", "welding", "assemble"] as const;

export type MachineType = (typeof MachineTypes)[number];

export interface MachineSelectProps extends React.ComponentProps<typeof Select> {
	handleSelectMachine: (value: string) => void;
	data: MachineProps[] | null;
	defaultId: string;
}

export interface TimeRangeProps extends React.ComponentProps<typeof Select> {
	handleSelectTime: (value: string) => void;
	timeRange: string;
}
