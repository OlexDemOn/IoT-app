import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export interface ThemeContext {
	theme: string;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContext | null>(null);

const key = "theme";

function getStoredTheme() {
	return localStorage.getItem(key) || "dark";
}

function setStoredTheme(theme: string) {
	localStorage.setItem(key, theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<string>(() => getStoredTheme());

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	useEffect(() => {
		setStoredTheme(theme);
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
