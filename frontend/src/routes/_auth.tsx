import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import React from "react";
import { Header } from "../components/layout/Header";

export const Route = createFileRoute("/_auth")({
	beforeLoad: ({ context, location }) => {
		console.log("beforeLoad", context);
		// @ts-ignore
		if (!context?.auth?.isAuthenticated) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<React.Fragment>
			<main className="flex flex-col gap-10 min-h-screen">
				<Header />
				<Outlet />
			</main>
		</React.Fragment>
	);
}
