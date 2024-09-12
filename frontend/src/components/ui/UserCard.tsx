import { Button, Checkbox, Form, Input, Modal } from "antd";
import { DeleteOutlined, EditOutlined, UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import type { SearchUser } from "../../types/users";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";

export const UserCard = ({
	user,
	handleDelUser,
	handleEditUser,
}: {
	user: SearchUser;
	handleDelUser: (user: SearchUser) => void;
	handleEditUser: (user: SearchUser) => (event: React.FormEvent<HTMLFormElement>) => void;
}) => {
	const auth = useAuth();
	const [del, setDel] = useState(false);
	const [edit, setEdit] = useState(false);
	const { theme } = useTheme();
	return (
		<div className="flex flex-col w-72 h-32 border p-4 rounded-lg m-5 bg-bg-200">
			<div className="truncate">{user.name}</div>
			<div className="truncate">{user.email}</div>
			<div className="flex flex-row justify-end">
				{auth.user?.name !== user.name && (
					<>
						<Button className="" onClick={() => setDel(true)}>
							<DeleteOutlined />
						</Button>
						<Modal
							title="Do you want to delete this user?"
							open={del}
							onCancel={() => setDel(false)}
							onOk={() => {
								handleDelUser(user);
								setDel(false);
							}}
							width={400}
						>
							All their info will be lost
						</Modal>
						<Button
							className=""
							onClick={() => {
								setEdit(true);
							}}
						>
							<EditOutlined />
						</Button>
						<Modal
							title={`Editing user ${user.name}`}
							open={edit}
							onCancel={() => setEdit(false)}
							onOk={() => {
								setEdit(false);
							}}
							footer={null}
							destroyOnClose={true}
							width={300}
						>
							<form onSubmit={handleEditUser(user)} className={`theme-${theme}`}>
								<div className="flex flex-col items-center space-y-3">
									<Input
										size="large"
										name="username"
										type="username"
										placeholder="New username (optional)"
										autoComplete="off"
										prefix={<UserOutlined />}
										className="mt-3 w-64"
									/>
									<Input
										size="large"
										name="email"
										type="email"
										placeholder="New email (optional)"
										autoComplete="off"
										prefix={<MailOutlined />}
										className="w-64"
									/>
									<Input
										size="large"
										name="password"
										type="password"
										placeholder="New password (optional)"
										autoComplete="off"
										prefix={<LockOutlined />}
										className="w-64"
									/>
								</div>
								<div className="flex flex-row justify-end w-full mt-5 space-x-3">
									<Button onClick={() => setEdit(false)} className="w-20">
										Cancel
									</Button>
									<Button onClick={() => setEdit(false)} htmlType="submit" type="primary" className="w-20">
										Edit
									</Button>
								</div>
							</form>
						</Modal>
					</>
				)}
			</div>
		</div>
	);
};

export const UserChecklist = ({ user, members }: { user: SearchUser; members?: string[] }) => {
	const [checked, setChecked] = useState(members?.includes(user.uuid));

	return (
		<Form.Item valuePropName="checked" className="my-0">
			<Checkbox
				name="uuid"
				value={user.uuid}
				checked={checked}
				className="flex border p-1 w-52 mr-4 my-2 bg-bg-200 rounded-lg truncate"
				onClick={() => setChecked(!checked)}
			>
				<p className="text-xs">{user.name}</p>
			</Checkbox>
		</Form.Item>
	);
};
