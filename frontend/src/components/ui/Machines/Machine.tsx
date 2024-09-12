import { Link } from "@tanstack/react-router";
import type { MachineProps } from "../../../types/machines";
import type { PropertiesProps } from "../../../types/types";
import { Circle } from "../Circle";

export const Machine = ({
	item,
	properties,
}: { item: MachineProps; properties: PropertiesProps[] | null | undefined }) => {
	const index = properties?.findIndex((prop) => prop.machine_type === item.machine_type);

	return properties ? (
		<MachineWrapper title={index !== undefined ? properties[index].machine_type : ""} id={item.machine_id}>
			<MachineProperties item={item} properties={index !== undefined ? properties[index] : null} />
		</MachineWrapper>
	) : null;
};

function MachineProperties({
	item,
	properties,
}: { item: MachineProps; properties: PropertiesProps | null | undefined }) {
	return properties?.property?.map((prop, index: number) => {
		return (
			<MachineRow
				key={prop}
				title={prop}
				metrics={properties.measure[index]}
				val={Number(item[prop as keyof MachineProps])}
				circleColor="success"
			/>
		);
	});
}

function MachineRow({
	title,
	metrics,
	val,
	circleColor,
}: { title: string; metrics: string; val: number; circleColor?: "success" | "warning" | "danger" }) {
	return (
		<div className="flex gap-2 justify-between items-center">
			<div>
				<span className="capitalize">{title}</span> <span className="text-text-200">[{metrics}]</span>
			</div>
			<Circle max={1000} value={val} appear={circleColor}>
				{val}
			</Circle>
		</div>
	);
}

const MachineWrapper = ({ children, title = "", id }: { children: React.ReactNode; title?: string; id: string }) => {
	return (
		<Link to={`./production/${id}`} className="hover:ring ring-primary-100 rounded-xl overflow-hidden min-w-72  h-fit">
			<div className="flex flex-col gap-4 bg-bg-200 p-4">
				<div className="uppercase font-bold text-center">{title}</div>
				{children}
			</div>
		</Link>
	);
};
