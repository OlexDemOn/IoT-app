import { createFileRoute } from "@tanstack/react-router";
import { Filter } from "../components/ui/Filter";
import { Machine } from "../components/ui/Machines/Machine";
import useFetchMachines from "../hooks/useFetchMachines";
import useFetchProperties from "../hooks/useFetchProperties";
import type { MachineProps } from "../types/machines";
import { FilterProvider } from "../components/providers/FilterContext";

export const Route = createFileRoute("/_auth/")({
	component: Index,
});

function Index() {
	const { machines, fetchData } = useFetchMachines();
	const { properties } = useFetchProperties();

	return (
		<main className="flex gap-20 flex-1 relativ ">
			<FilterProvider properties={properties} fetchData={fetchData}>
				<Filter />
			</FilterProvider>
			<div className={"flex flex-wrap gap-6 w-full px-5 justify-evenly sm:mt-0 mt-16"}>
				{machines && machines?.length > 0 ? (
					machines.map((item: MachineProps) => <Machine item={item} key={item.machine_id} properties={properties} />)
				) : (
					<span>For selected filters the list of machines is empty</span>
				)}
			</div>
		</main>
	);
}
