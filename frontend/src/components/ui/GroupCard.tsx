import { Button, Input, Modal, Select } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { Group, SearchUser } from "../../types/users";
import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { UserChecklist } from "./UserCard";

export const GroupCard = ({
	group,
	handleDelGroup,
	handleEditGroup,
	users,
	prodLines,
	handleEditFetch,
}: {
	group: Group;
	handleDelGroup: (group: Group) => void;
	handleEditGroup: (group: Group, line: string) => (event: React.FormEvent<HTMLFormElement>) => void;
	users: SearchUser[] | null | undefined;
	prodLines: { product_line_id: string }[] | null | undefined;
	handleEditFetch: () => void;
}) => {
	const [del, setDel] = useState(false);
	const [edit, setEdit] = useState(false);
	const [line, setLine] = useState("");
	const { theme } = useTheme();

	const lineOptions = (l: { product_line_id: string }[]) => {
		const options = [];
		for (let i = 0; i < l.length; i++) {
			options.push({
				value: l[i].product_line_id,
				label: l[i].product_line_id,
			});
		}
		return options;
	};

	return (
		<div className="flex flex-row justify-between w-72 h-32 border p-4 rounded-lg m-5 bg-bg-200 text-text-100">
			<div className="flex flex-col max-w-30 truncate">
				<div className="truncate">{group.group_name}</div>
				<div className="">Members: {group.members_uuid.length}</div>
				{(group.product_line_id && <div>Product line id: {group.product_line_id}</div>) ||
					(!group.product_line_id && <div>No product line</div>)}
			</div>
			<div className="flex items-end">
				{group.group_name !== "admin" && (
					<>
						<Button className="" onClick={() => setDel(true)}>
							<DeleteOutlined />
						</Button>
						<Modal
							title="Do you want to delete this group?"
							open={del}
							onCancel={() => setDel(false)}
							onOk={() => {
								handleDelGroup(group);
								setDel(false);
							}}
							width={400}
						>
							Current members will be removed from it
						</Modal>
						<Button
							className=""
							onClick={() => {
								handleEditFetch();
								setEdit(true);
							}}
						>
							<EditOutlined />
						</Button>
						<Modal
							title={`Editing group ${group.group_name}`}
							open={edit}
							onCancel={() => setEdit(false)}
							onOk={() => {
								setEdit(false);
							}}
							footer={null}
							destroyOnClose={true}
							width={500}
						>
							<form onSubmit={handleEditGroup(group, line)} className={`theme-${theme}`}>
								<div className="flex flex-col space-y-3">
									<Input
										size="large"
										name="newname"
										type="newname"
										placeholder="New group name (optional)"
										autoComplete="off"
										className="mt-3 w-64"
									/>
								</div>
								<div className="mt-4">Add users to this group</div>
								<div className="flex flex-row flex-wrap my-3">
									{users ? (
										users.map((user: SearchUser) => (
											<UserChecklist user={user} key={user.uuid} members={group.members_uuid} />
										))
									) : (
										<span>The list of users is empty</span>
									)}
								</div>
								<div className="mt-4">Select the product line</div>
								<Select
									size="large"
									allowClear
									style={{ width: "75%" }}
									defaultValue={group.product_line_id}
									placeholder="Choose Line"
									options={prodLines ? lineOptions(prodLines) : [{ label: "no data", value: "no" }]}
									onChange={(value) => setLine(value)}
								/>
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
