import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";

interface CircleProps extends ComponentPropsWithoutRef<"div"> {
	size?: number;
	max?: number;
	value?: number;
	appear?: "warning" | "danger" | "success";
}

const getColor = (appear: CircleProps["appear"]): string => {
	switch (appear) {
		case "success":
			return "var(--success-color)";
		case "warning":
			return "var(--warning-color)";
		case "danger":
			return "var(--danger-color)";
		default:
			return "var(--success-color)";
	}
};

const Circle = forwardRef<ElementRef<"div">, CircleProps>(
	({ children, className, max = 100, value = 0, appear = "success", ...props }, ref) => {
		const rotationDegree = (value / max) * 100 * 3.6;
		const color = getColor(appear);
		return (
			<div className="relative flex items-center justify-center size-16 " {...props} ref={ref}>
				<div
					className="absolute inset-0 flex items-center justify-center rounded-full bg-bg-100"
					style={{
						backgroundImage: `conic-gradient(${color} ${rotationDegree}deg, transparent ${rotationDegree}deg)`,
					}}
				/>
				<div className="relative flex items-center justify-center size-14 rounded-full bg-bg-200">
					<span className="absolute text-xl font-semibold">{children}</span>
				</div>
			</div>
		);
	},
);
export { Circle };
