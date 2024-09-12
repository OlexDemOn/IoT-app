import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { createUsers, deleteUsers, modifyUser } from "../../api/endpoints";
import type { SearchUser } from "../../types/users";
import { Button, Input, Modal } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { UserFilter } from "./UserFilters";
import { Userdata } from "./ShowData/Userdata";
import useFetchGroup from "../../hooks/useFetchGroup";
import useFetchUser from "../../hooks/useFetchUser";

export function UserPage() {
	const { group, fetchGroupData } = useFetchGroup();
	const { users, fetchUserData } = useFetchUser();
	const [newUser, setNewUser] = useState(false);
	const [filters, setFilters] = useState(false);
	const [namefilter, setNamefilter] = useState(/.*/);
	const [groupfilter, setGroupfilter] = useState("");

	const auth = useAuth();

	const handleNewUser = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const userData: SearchUser = {
			uuid: "",
			name: data.get("username") as string,
			email: data.get("email") as string,
			password: data.get("password") as string | "password",
			groups: [],
		};
		if (auth.user?.uuid) {
			await createUsers(auth.user?.uuid, userData);
		}
		fetchUserData();
		setNewUser(false);
	};

	const handleDelUser = async (user: SearchUser) => {
		if (auth.user?.uuid) {
			await deleteUsers(auth.user.uuid, user);
			fetchUserData();
		}
	};

	const handleEditUser = (user: SearchUser) => async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const userData: SearchUser = {
			uuid: user.uuid as string,
			name: data.get("username") as string,
			email: data.get("email") as string,
			password: data.get("password") as string,
			groups: [],
		};
		if (auth.user?.uuid) {
			await modifyUser(auth.user.uuid, userData);
			fetchUserData();
		}
	};

	return (
		<div className="flex">
			<div className="flex flex-col min-w-56 w-full max-w-96 h-full bg-bg-200 border p-4 rounded-lg mt-5 sticky top-20">
				<div className="space-y-4 divide">
					<div className="flex justify-center mb-4">Manage users</div>
					<hr />
					<div className="flex flex-col items-center">
						<Button className="w-3/4" onClick={() => setNewUser(true)}>
							Add new user
						</Button>
						<Modal
							title="Creating new user"
							open={newUser}
							onCancel={() => setNewUser(false)}
							destroyOnClose={true}
							footer={null}
							width={300}
						>
							<form onSubmit={handleNewUser}>
								<div className="flex flex-col items-center space-y-3">
									<Input
										size="large"
										name="username"
										type="username"
										placeholder="Username"
										autoComplete="off"
										prefix={<UserOutlined />}
										required
										className="mt-3 w-64"
									/>
									<Input
										size="large"
										name="email"
										type="email"
										placeholder="Email"
										autoComplete="off"
										prefix={<MailOutlined />}
										required
										className="w-64"
									/>
									<Input
										size="large"
										name="password"
										type="password"
										placeholder="Password"
										autoComplete="off"
										prefix={<LockOutlined />}
										required
										className="w-64"
									/>
								</div>
								<div className="flex flex-row justify-end w-full mt-5 space-x-3">
									<Button onClick={() => setNewUser(false)} className="w-20">
										Cancel
									</Button>
									<Button htmlType="submit" type="primary" className="w-20">
										Create
									</Button>
								</div>
							</form>
						</Modal>
					</div>
					<hr />
					<div className="flex justify-center">
						<Button
							className="w-3/4"
							onClick={() => {
								fetchGroupData();
								setFilters(!filters);
							}}
						>
							Filter users
						</Button>
					</div>
					{filters && <UserFilter group={group} setNamefilter={setNamefilter} setGroupfilter={setGroupfilter} />}
				</div>
			</div>
			<div className="flex flex-wrap flex-row justify-center w-full">
				{Userdata(users, namefilter, groupfilter, handleDelUser, handleEditUser)}
			</div>
		</div>
	);
}
