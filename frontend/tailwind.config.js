/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	plugins: [],
	theme: {
		extend: {
			borderColor: {
				DEFAULT: "var(--border-color)",
			},
			borderWidth: "var(--border-width)",
			colors: {
				primary: {
					100: "var(--color-primary-100)",
					200: "var(--color-primary-200)",
					300: "var(--color-primary-300)",
				},
				secondary: {
					100: "var(--color-secondary-100)",
					200: "var(--color-secondary-200)",
					300: "var(--color-secondary-300)",
				},
				text: {
					100: "var(--color-text-100)",
					200: "var(--color-text-200)",
				},
				bg: {
					100: "var(--bg-color-100)",
					200: "var(--bg-color-200)",
					300: "var(--bg-color-300)",
				},
				glass: "var(--glass-color)",
			},
		},
		fontFamily: {
			montserrat: ["Montserrat"],
		},
	},
};
