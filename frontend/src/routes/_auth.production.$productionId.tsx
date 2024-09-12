import { createFileRoute } from "@tanstack/react-router";
import { Checkbox, type CheckboxProps, Select } from "antd";
import { useEffect, useState } from "react";
import { getAllMachine } from "../api/endpoints";
import { useAuth } from "../components/providers/AuthProvider";
import { SelectProperties } from "../components/ui/MachineSelectProperties/SelectProperties";
import { MachineChart } from "../components/ui/MachinesCharts/MachineChart";
import type { MachineProps, MachineSelectProps, TimeRangeProps } from "../types/machines";

export const Route = createFileRoute("/_auth/production/$productionId")({
	component: () => <Production />,
});

const TimeRange = [
	{
		label: "Today",
		value: "today",
	},
	{
		label: "Yesterday",
		value: "yesterday",
	},
	{
		label: "Last hour",
		value: "lasthour",
	},
	{
		label: "Last 10 minutes",
		value: "last10minutes",
	},
	{
		label: "Last week",
		value: "lastweek",
	},

	{
		label: "Last month",
		value: "lastmonth",
	},
];

function Production() {
	const [currentMachine, setCurrentMachine] = useState<MachineProps | null>(null);
	const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
	const [timeRange, setTimeRange] = useState<string>("today");
	const [data, setData] = useState<MachineProps[] | null>(null);
	const [dynamicData, setDynamicData] = useState<boolean>(false);

	const auth = useAuth();
	const { productionId } = Route.useParams();

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		if (auth.user?.uuid) {
			const { data } = await getAllMachine(auth.user.uuid);
			await (data ? setData(data) : null);
			await setCurrentMachine(data?.find((el) => String(el.machine_id) === productionId) || null);
		}
	};
	useEffect(() => {
		handleSelectMachine(productionId);
	}, [productionId]);

	const handleSelectMachine = async (value: string) => {
		const machine = data?.find((el) => String(el.machine_id) === String(value));
		await setCurrentMachine(machine || null);
	};

	const handleSelectTime = (value: string) => {
		setTimeRange(value);
	};

	const handleSelectProperties = (value: string[] | unknown) => {
		setSelectedProperties(value as string[]);
	};

	const handleDynamicData: CheckboxProps["onChange"] = (value) => {
		setDynamicData(value.target.checked);
	};
	return (
		<div className="flex flex-col gap-4 flex-1 px-5">
			<div className="text-3xl flex gap-4 items-center flex-wrap">
				<MachineSelect
					data={data}
					handleSelectMachine={handleSelectMachine}
					defaultId={productionId}
					className="sm:w-auto w-full"
				/>
				<TimeSelect handleSelectTime={handleSelectTime} timeRange={timeRange} className="sm:w-36 w-full" />
				<SelectProperties
					onChange={handleSelectProperties}
					size="large"
					key={currentMachine?.machine_id}
					machineType={currentMachine?.machine_type || "drilling"}
					selectedProperties={selectedProperties}
					setSelectedProperties={setSelectedProperties}
					className="sm:w-[450px] w-fit"
				/>
				<Checkbox onChange={handleDynamicData}>Dynamic data</Checkbox>
			</div>

			{currentMachine ? (
				<MachineChart
					key={`${currentMachine.machine_id}-${timeRange}`}
					id={currentMachine.machine_id}
					selectedProperties={selectedProperties}
					timeRange={timeRange}
					dynamicData={dynamicData}
					machine_type={currentMachine.machine_type}
				/>
			) : null}
		</div>
	);
}

const MachineSelect = ({ handleSelectMachine, data, className, defaultId }: MachineSelectProps) => {
	return (
		<Select
			size="large"
			defaultValue={defaultId}
			onChange={handleSelectMachine}
			className={className}
			options={
				data
					? data.map((el) => ({
							value: String(el.machine_id),
							label: `${el.machine_type}`,
						}))
					: []
			}
		/>
	);
};

const TimeSelect = ({ handleSelectTime, className, timeRange }: TimeRangeProps) => {
	return (
		<Select
			size="large"
			options={TimeRange}
			defaultValue={timeRange}
			className={className}
			onChange={handleSelectTime}
		/>
	);
};
