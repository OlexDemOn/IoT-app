import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ConfigProvider, theme as themeChange } from "antd";
import { useTheme } from "../components/providers/ThemeProvider";
import { getCssVariable } from "../components/utils/getCssVariable";

const Home = () => {
	const { theme } = useTheme();
	const primaryColor = getCssVariable("--color-primary-100").trim();
	return (
		<ConfigProvider
			theme={{
				// Use CSS variables for theme customization
				token: {
					colorPrimary: primaryColor,
					colorLink: primaryColor,
				},
				algorithm: theme === "dark" ? themeChange.darkAlgorithm : themeChange.defaultAlgorithm,
			}}
		>
			<>
				<div className={`min-h-screen h-full font-sans antialiased theme-${theme} text-text-100 bg-bg-100 `}>
					<Outlet />
				</div>
			</>
		</ConfigProvider>
	);
};

export const Route = createRootRoute({
	component: Home,
});
