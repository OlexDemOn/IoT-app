import { Input, Select } from "antd";
import type { Group } from "../../types/users";
import { UserOutlined } from "@ant-design/icons";

export const UserFilter = ({
	group,
	setNamefilter,
	setGroupfilter,
}: {
	group: Group[] | null | undefined;
	setNamefilter: (value: React.SetStateAction<RegExp>) => void;
	setGroupfilter: (value: React.SetStateAction<string>) => void;
}) => {
	const groupOptions = (group: Group[]) => {
		const options = [];
		for (let i = 0; i < group.length; i++) {
			options.push({
				value: group[i].groups_id,
				label: group[i].group_name,
			});
		}
		return options;
	};

	return (
		<div className="flex flex-col items-center space-y-4">
			<Input
				size="large"
				name="filter"
				type="filter"
				placeholder="Filter by username"
				prefix={<UserOutlined />}
				className="w-3/4"
				onChange={(test) => setNamefilter(new RegExp(test.target.value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")))}
			/>
			<Select
				size="large"
				mode="multiple"
				allowClear
				style={{ width: "75%" }}
				placeholder="Filter by group"
				options={group ? groupOptions(group) : [{ label: "no data", value: "no" }]}
				onChange={(test) => {
					setGroupfilter(test);
				}}
			/>
		</div>
	);
};
