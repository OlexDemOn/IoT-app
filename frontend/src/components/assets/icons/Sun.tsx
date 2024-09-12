import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const Sun = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className={twMerge("size-6", props.className)}
			{...props}
			ref={ref}
		>
			<title>Theme Toggle</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
			/>
		</svg>
	);
});

export { Sun };
