import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import type { Group, SearchUser } from "../../types/users";
import { useTheme } from "../providers/ThemeProvider";
import { createGroup, deleteGroup, getProdLines, modifyGroup } from "../../api/endpoints";
import { Button, Input, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UserChecklist } from "./UserCard";
import { Groupdata } from "./ShowData/Groupdata";
import useFetchGroup from "../../hooks/useFetchGroup";
import useFetchUser from "../../hooks/useFetchUser";

export function GroupPage() {
	const { group, fetchGroupData } = useFetchGroup();
	const { users, fetchUserData } = useFetchUser();
	const [prodLines, setProdLines] = useState<{ product_line_id: string }[] | null | undefined>([]);
	const [editFetch, setEditFetch] = useState(true);
	const [newGroup, setNewGroup] = useState(false);
	const auth = useAuth();
	const { theme } = useTheme();

	const fetchProdLines = async () => {
		if (auth.user?.uuid) {
			const { data } = await getProdLines(auth.user.uuid);
			setProdLines(data);
		}
	};

	const handleEditFetch = () => {
		if (editFetch) {
			fetchUserData();
			fetchProdLines();
			setEditFetch(false);
		}
	};

	const handleNewGroup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const groupMembers = data.getAll("uuid") as string[];
		const groupData: Group = {
			groups_id: "",
			group_name: data.get("name") as string,
			members_uuid: groupMembers,
		};
		if (auth.user?.uuid) {
			await createGroup(auth.user?.uuid, groupData);
		}
		fetchGroupData();
		setEditFetch(true);
		setNewGroup(false);
	};

	const handleDelGroup = async (group: Group) => {
		if (auth.user?.uuid) {
			await deleteGroup(auth.user.uuid, group);
			fetchGroupData();
			setEditFetch(true);
		}
	};

	const handleEditGroup = (group: Group, line: string) => async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const newname = data.get("newname") as string;
		const groupMembers = data.getAll("uuid") as string[];
		if (auth.user?.uuid) {
			await modifyGroup(auth.user.uuid, group, newname, groupMembers, line);
			fetchGroupData();
			setEditFetch(true);
		}
	};

	return (
		<div className="flex">
			<div className="flex flex-col min-w-56 w-full max-w-96 h-full bg-bg-200 border p-4 rounded-lg mt-5 sticky top-24">
				<div className="space-y-4 divide">
					<div className="flex justify-center mb-4">Manage groups</div>
					<hr />
					<div className="flex flex-col items-center">
						<Button
							className="w-3/4"
							onClick={() => {
								setNewGroup(true);
								handleEditFetch();
							}}
						>
							Add new group
						</Button>
						<Modal
							title="Creating new group"
							open={newGroup}
							onCancel={() => setNewGroup(false)}
							destroyOnClose={true}
							footer={null}
							width={500}
						>
							<form onSubmit={handleNewGroup} className={`theme-${theme}`}>
								<div className="flex flex-col space-y-3">
									<Input
										size="large"
										name="name"
										type="name"
										placeholder="Group name"
										autoComplete="off"
										prefix={<UserOutlined />}
										required
										className="mt-3 w-64"
									/>
								</div>
								<div className="mt-4">Add users to the new group</div>
								<div className="flex flex-row flex-wrap my-3">
									{users ? (
										users.map((user: SearchUser) => <UserChecklist user={user} key={user.uuid} />)
									) : (
										<span>The list of users is empty</span>
									)}
								</div>
								<div className="flex flex-row justify-end w-full mt-5 space-x-3">
									<Button onClick={() => setNewGroup(false)}>Cancel</Button>
									<Button htmlType="submit" type="primary">
										Create
									</Button>
								</div>
							</form>
						</Modal>
					</div>
				</div>
			</div>
			<div className="flex flex-wrap flex-row justify-center w-full">
				{Groupdata(group, handleDelGroup, handleEditGroup, users, prodLines, handleEditFetch)}
			</div>
		</div>
	);
}
