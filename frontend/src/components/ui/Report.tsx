import { useState } from "react";
import { Button, DatePicker } from "antd";
import useGetReport from "../../hooks/useGetReport";
import dayjs from "dayjs";

export const Report = () => {
	const { createReport } = useGetReport();
	const { RangePicker } = DatePicker;
	const [date, setDate] = useState<string[]>([
		dayjs().subtract(1, "month").format("YYYY-MM-DD").toString(),
		dayjs().format("YYYY-MM-DD").toString(),
	]);
	return (
		<div className="w-full flex flex-col gap-y-4">
			<h2 className="text-text-100 text-2xl">Report</h2>
			<div className={"justify-center space-y-4"}>
				<RangePicker
					allowEmpty={[false, false]}
					defaultValue={[dayjs().subtract(1, "month"), dayjs()]}
					onChange={(_date, dateString) => {
						setDate(dateString);
						console.log(dateString);
					}}
				/>
				<Button
					type="primary"
					className="w-full text-lg"
					size="large"
					disabled={date[0] === "" || date[1] === ""}
					onClick={() => {
						console.log(date);
						createReport(date);
					}}
				>
					Create report
				</Button>
			</div>
		</div>
	);
};
