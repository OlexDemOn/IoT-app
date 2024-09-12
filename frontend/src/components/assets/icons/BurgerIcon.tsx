import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const BurgerIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
	return (
		<svg
			className={twMerge("size-6", props.className)}
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 17 14"
			ref={ref}
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M1 1h15M1 7h15M1 13h15"
			/>
		</svg>
	);
});

export { BurgerIcon };
