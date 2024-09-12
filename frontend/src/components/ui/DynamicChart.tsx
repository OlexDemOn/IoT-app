import type * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import { useTheme } from "../providers/ThemeProvider";
import { getCssVariable } from "../utils/getCssVariable";
import { getAverage } from "../utils/arrays";
import type { ChartOptions } from "../../types/types";

const primaryColor = getCssVariable("--color-primary-100").trim();

const DynamicChart = ({ data, time, chartTitle }: { data: number[]; time: Date[]; chartTitle: string }) => {
	const { theme } = useTheme();
	const textColor =
		theme === "dark" ? getCssVariable("--color-text-100").trim() : getCssVariable("--bg-color-100").trim();
	const option = getOption({ chartTitle, textColor, data, time });

	return (
		<div className="relative w-5/12 min-w-64 min-h-[320px] h-full rounded-md border verflow-hidden shadow-sm shadow-gray-700 bg-bg-200 overflow-hidden">
			<ReactECharts key={theme} option={option} notMerge={true} lazyUpdate={true} />
			<div className="absolute left-0 bottom-[10px] text-text-200 w-full text-center">
				Avg: {getAverage(data).toFixed()}, Max: {Math.max(...data).toFixed()}, Min: {Math.min(...data).toFixed()}
			</div>
		</div>
	);
};

const getOption = ({ chartTitle, textColor, data, time }: ChartOptions): echarts.EChartsCoreOption => {
	return {
		color: [primaryColor],

		title: {
			text: chartTitle,
			top: 10,
			left: "center",
			textStyle: {
				color: textColor,
			},
		},
		tooltip: {
			trigger: "axis",
			formatter: (params: echarts.TooltipComponentFormatterCallbackParams[]) => {
				const firstParam = params[0];
				//@ts-ignore
				return `${firstParam.axisValueLabel} : ${firstParam.value[1]}`;
			},
			axisPointer: {
				animation: false,
			},
		},
		xAxis: {
			type: "time",
			splitLine: {
				show: false,
			},
			axisLine: {
				symbol: "arrow",
			},
			name: "Time",
		},
		yAxis: {
			type: "value",
			boundaryGap: [0, "100%"],
			splitLine: {
				show: false,
			},
			textStyle: {
				color: "red",
			},
		},
		series: [
			{
				name: "Fake Data",
				type: "line",
				showSymbol: false,
				data: data.map((item, index) => {
					return [new Date(time[index]), item];
				}),
			},
		],
	};
};

export { DynamicChart };
