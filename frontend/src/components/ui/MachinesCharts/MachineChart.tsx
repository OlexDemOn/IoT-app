import { useEffect, useState } from "react";
import { getMachineByID } from "../../../api/endpoints";
import type { MachineProps } from "../../../types/machines";
import { DynamicChart } from "../DynamicChart";
import type { MachineChartProps } from "../../../types/types";
import useWebSocket from "../../../hooks/useWebSocket";
import { TimeFilter } from "../../utils/timeFilter";
import { useAuth } from "../../providers/AuthProvider";

export const MachineChart = ({ id, timeRange, selectedProperties, dynamicData, machine_type }: MachineChartProps) => {
	const [dataSet, setDataSet] = useState<MachineProps[] | null | undefined>([]);
	const { onOpen, onClose, onMessage, send, connect, disconnect } = useWebSocket("ws/machines");
	const auth = useAuth();

	const fetchData = async () => {
		const { start, end } = TimeFilter(timeRange);
		const dataSet = await getMachineByID(id, start.toISOString(), end.toISOString());
		setDataSet(dataSet.data);
	};

	const connectToMachine = async (connection: boolean) => {
		if (connection) {
			connect();
		} else {
			disconnect();
		}
		onOpen(() => {
			send(JSON.stringify({ machine_type: machine_type, uuid: auth.user?.uuid || "", disconnect: false }));
		});
		onClose(() => {
			send(JSON.stringify({ machine_type: machine_type, uuid: auth.user?.uuid || "", disconnect: true }));
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchData();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!dynamicData) {
			connectToMachine(false);
			return;
		}
		fetchData();
		connectToMachine(true);
	}, [dynamicData]);

	onMessage((e) => {
		setDataSet((prev) => [...(prev || []), JSON.parse(e.data)]);
	});

	return dataSet && dataSet.length > 0 ? (
		<div className="flex gap-4 flex-wrap flex-1 justify-evenly items-center">
			{selectedProperties.map((property: string) => (
				<DynamicChart
					key={`${property}-${timeRange}`}
					data={dataSet.map((item) => Number(item[property as keyof MachineProps]))}
					time={dataSet.map((item) => new Date(item.created_at))}
					chartTitle={(property[0].toUpperCase() + property.slice(1)).replace("_", " ")}
				/>
			))}
		</div>
	) : (
		<>No data for these filters</>
	);
};
