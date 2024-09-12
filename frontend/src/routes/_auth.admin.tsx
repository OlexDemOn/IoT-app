import { createFileRoute, redirect } from "@tanstack/react-router";
import { checkAdmin } from "../api/endpoints";
import { useState } from "react";
import { Button } from "antd";
import { UserPage } from "../components/ui/UserPage";
import { GroupPage } from "../components/ui/GroupPage";

const fallback = "/" as const;

export const Route = createFileRoute("/_auth/admin")({
	beforeLoad: async ({ context }) => {
		//@ts-ignore
		const admin = await checkAdmin(context.auth.user.uuid, context.auth.user);
		if (!admin.data) {
			alert("No admin permissions");
			throw redirect({ to: fallback });
		}
	},
	component: Admin,
});

function Admin() {
	const [adminMenu, setAdminMenu] = useState(true);

	const handleButtonClick = (num: boolean) => {
		if (adminMenu !== num) {
			setAdminMenu(!adminMenu);
		}
	};

	const handleStyle = (num: boolean) => {
		if (adminMenu === num) {
			return "primary";
		}
		return "default";
	};

	return (
		<div>
			<div className="flex sticky top-20 z-[2]">
				<div className="min-w-56 w-full max-w-96" />
				<div className="w-full max-w-1/2" />
				<nav className="flex flex-row justify-evenly w-1/6 min-w-60 bg-bg-200 mb-4 p-2 rounded-lg border">
					<Button type={handleStyle(true)} onClick={() => handleButtonClick(true)}>
						Users Page
					</Button>
					<Button type={handleStyle(false)} onClick={() => handleButtonClick(false)}>
						Group Page
					</Button>
				</nav>
				<div className="w-full" />
			</div>
			<div>
				{adminMenu && <UserPage />}
				{!adminMenu && <GroupPage />}
			</div>
		</div>
	);
}
