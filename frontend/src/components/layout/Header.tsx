import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { LogoTTPSC } from "../assets/icons/LogoTTPSC";
import { Moon } from "../assets/icons/Moon";
import { Sun } from "../assets/icons/Sun";
import { BurgerIcon } from "../assets/icons/BurgerIcon";
import { Button } from "antd";

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { theme, toggleTheme } = useTheme();
	const router = useRouter();
	const navigate = useNavigate();
	const auth = useAuth();

	const toggleMenu = () => {
		setIsMenuOpen((prev) => !prev);
	};

	const handleLogout = async () => {
		auth.logout();
		router.invalidate().then(() => navigate({ to: "/login" }));
	};

	return (
		<header className="flex items-center justify-between sticky w-full left-0 top-0 p-5 z-50 bg-bg-100 min-h-16">
			<LogoTTPSC className="w-32 h-auto" />

			<div
				className={`md:flex flex w-full md:justify-between md:relative ${isMenuOpen ? "fixed" : "hidden"} top-0 left-0 bg-bg-200 flex-col md:bg-transparent md:flex-row md:p-0 p-4 md:border-none border-b`}
			>
				<Navigatinon setIsMenuOpen={setIsMenuOpen} />

				<Button onClick={toggleTheme} type="link">
					{theme === "light" ? <Moon /> : <Sun />}
				</Button>
				<Button type="default" onClick={handleLogout}>
					Logout
				</Button>
			</div>

			<Button className={"md:hidden absolute right-5 z-20 size-8 grid place-items-center"} onClick={toggleMenu}>
				<span className="sr-only">Open main menu</span>
				<BurgerIcon />
			</Button>
		</header>
	);
}

function Navigatinon({ setIsMenuOpen }: { setIsMenuOpen: (value: boolean) => void }) {
	return (
		<nav className="items-center flex justify-center relative md:flex-row md:bg-transparent w-full left-0 top-0 z-10 flex-col">
			<NavLink onClick={() => setIsMenuOpen(false)} to="/" text="Main Menu" />
			<NavLink onClick={() => setIsMenuOpen(false)} to="/admin" text="Admin Settings" />
		</nav>
	);
}

function NavLink({
	to,
	text,
	exact,
	onClick,
}: {
	to: string;
	text: string;
	exact?: boolean;
	onClick?: () => void;
}) {
	return (
		<Link
			onClick={onClick}
			to={to}
			activeOptions={{ exact }}
			className="lg:px-4 px-2 py-2 text-text-100 [&.active]:font-bold [&.active]:text-primary-100 hover:text-primary-100 lg:text-lg md:text-sm "
		>
			{text}
		</Link>
	);
}
