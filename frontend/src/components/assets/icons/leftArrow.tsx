import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const LeftArrow = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			ref={ref}
			className={twMerge("size-6", props.className)}
			{...props}
		>
			<title>Left Arrow</title>
			<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
		</svg>
	);
});

export { LeftArrow };
