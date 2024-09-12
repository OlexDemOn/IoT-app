import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const Card = forwardRef<ElementRef<"div">, ComponentPropsWithoutRef<"div">>(
	({ children, className, ...props }, ref) => {
		return (
			<div {...props} ref={ref} className={twMerge("flex flex-col gap-5 shadow-md rounded-2xl p-4", className)}>
				{children}
			</div>
		);
	},
);

const CardTitle = forwardRef<ElementRef<"h2">, ComponentPropsWithoutRef<"h2">>(
	({ children, className, ...props }, ref) => {
		return (
			<h2 {...props} ref={ref} className={twMerge("text-xl font-bold", className)}>
				{children}
			</h2>
		);
	},
);

export { Card, CardTitle };
