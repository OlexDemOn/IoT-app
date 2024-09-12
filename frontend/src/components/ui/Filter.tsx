import { Button, Input, Select } from "antd";
import type React from "react";
import useFilters from "../../hooks/useFilters";
import type { FilterProps } from "../../types/types";
import { FilterIcon } from "../assets/icons/FilterIcon";
import { useFilterContext } from "../providers/FilterContext";
import { useState } from "react";
import { Report } from "../ui/Report";
import { FileOutlined } from "@ant-design/icons";

export const Filter = () => {
	const { open, setOpen } = useFilterContext();
	const [isReport, setReport] = useState(false);

	return (
		<div
			className={`sm:sticky absolute z-10 left-0 sm:left-auto top-20 transition-all flex flex-col ${open ? "sm:ml-0 h-fit" : "sm:-ml-80 h-auto"} items-center gap-5 sm:p-5 p-2 bg-bg-200 w-full sm:min-w-80 sm:max-w-80`}
		>
			<div
				className={
					"flex flex-col items-center py-4 absolute top-0 w-10 space-y-4 sm:h-full h-12 right-0 sm:-right-10 transition-all bg-bg-200 md:rounded-r-lg sm:items-start"
				}
			>
				<FilterIcon
					className={"size-6 mx-auto hover:fill-primary-100 cursor-pointer"}
					onClick={() => {
						if (!(open === true && isReport !== false)) setOpen(!open);
						setReport(false);
					}}
					onKeyDown={() => {
						if (!(open === true && isReport !== false)) setOpen(!open);
						setReport(false);
					}}
				/>
				<FileOutlined
					className={"size-4 mx-auto hover:text-primary-100 "}
					onClick={() => {
						if (!(open === true && isReport !== true)) setOpen(!open);
						setReport(true);
					}}
					onKeyDown={() => {
						if (!(open === true && isReport !== true)) setOpen(!open);
						setReport(true);
					}}
				/>
			</div>
			{!isReport ? (
				<div className="w-full  flex flex-col gap-y-4">
					<h2 className="text-text-100 text-2xl">Filters</h2>
					<AddFilter />
					<div className="h-[calc(100vh-276px)] w-full">
						<FilterForm />
					</div>{" "}
				</div>
			) : (
				<Report />
			)}
		</div>
	);
};

const AddFilter = () => {
	const { currentSelectProperty, options, setCurrentSelectProperty, activeFilters, setActiveFilters } =
		useFilterContext();
	const handleAddFilter = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLElement>) => {
		e.preventDefault();

		if (activeFilters?.includes(currentSelectProperty)) return;

		if (options) {
			const index = options.findIndex((option) => option.value === currentSelectProperty);
			if (index !== -1) {
				options[index].disabled = true;
				setCurrentSelectProperty(index + 1 < options.length ? options[index + 1].value : options[index].value);

				setActiveFilters([...(activeFilters || []), currentSelectProperty]);
			}
		}
	};

	const handleOnChange = (value: string) => {
		setCurrentSelectProperty(value);
	};

	return (
		<form onSubmit={handleAddFilter} className="flex justify-between items-center w-full">
			{options && (
				<Select
					size="large"
					key={currentSelectProperty}
					style={{ minWidth: "150px" }}
					defaultValue={currentSelectProperty}
					options={options}
					optionRender={(option) => <>{option.data.desc}</>}
					value={currentSelectProperty}
					onChange={handleOnChange}
				/>
			)}
			<input type="submit" hidden />
			<Button className="rounded-full" size="large" htmlType="submit">
				+
			</Button>
		</form>
	);
};

const FilterForm = () => {
	const { activeFilters, setActiveFilters, fetchData, open, options } = useFilterContext();
	const { filters, setFilters, handleClear, handleFilter, handleSubmit } = useFilters(fetchData);

	const handleDeleteFilter = async (item: string) => {
		const index = activeFilters?.indexOf(item);
		if (index !== -1) {
			index !== undefined && activeFilters?.splice(index, 1);
			setActiveFilters([...(activeFilters || [])]);
			if (options) {
				const index = options.findIndex((option) => option.value === item);
				if (index !== -1) {
					options[index].disabled = false;
				}
			}
		}
		filters && delete filters[`${item}-start` as keyof FilterProps];
		filters && delete filters[`${item}-end` as keyof FilterProps];
		setFilters({ ...filters });
		fetchData(filters);
	};

	return (
		<form onSubmit={handleSubmit} className={`flex flex-col w-full h-full justify-between ${open ? "" : "hidden"}`}>
			<div className="relative flex flex-col no-scrollbar overflow-y-scroll h-full">
				<div className="flex-1 space-y-4">
					{activeFilters?.map((item: string) => (
						<div key={item} className="flex flex-col gap-2">
							<span className="capitalize">{item[0].toUpperCase() + item.slice(1).replace(/_/g, " ")}:</span>
							<div className="flex gap-4">
								<Input
									type="number"
									size="large"
									autoComplete="off"
									placeholder="From:"
									name={`${item}-start`}
									value={filters ? filters[`${item}-start` as keyof FilterProps] || "" : ""}
									onChange={handleFilter}
								/>
								<Input
									type="number"
									autoComplete="off"
									placeholder="To:"
									name={`${item}-end`}
									value={filters ? filters[`${item}-end` as keyof FilterProps] || "" : ""}
									onChange={handleFilter}
								/>
							</div>
							<div
								className="absolute right-0 cursor-pointer size-5 flex items-center justify-center"
								onClick={() => handleDeleteFilter(item)}
								onKeyDown={() => handleDeleteFilter(item)}
							>
								x
							</div>
						</div>
					))}
				</div>
				<div className="min-h-10 w-full backdrop-blur-xl sticky left-0 bottom-0 pointer-events-none" />
			</div>

			<div className="flex gap-3 justify-between w-full">
				<Button type="primary" className="w-full text-lg" size="large" htmlType="submit">
					Apply
				</Button>
				<Button type="primary" className="w-full text-lg" size="large" onClick={handleClear}>
					Clear
				</Button>
			</div>
		</form>
	);
};
