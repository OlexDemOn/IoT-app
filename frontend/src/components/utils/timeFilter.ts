export function TimeFilter(timeRange: string) {
	const start = new Date();
	const end = new Date();

	switch (timeRange) {
		case "today":
			start.setUTCHours(0, 0, 0, 0);
			break;
		case "lasthour":
			start.setHours(start.getHours() - 1);
			break;
		case "yesterday":
			start.setDate(start.getDate() - 1);
			start.setUTCHours(0, 0, 0, 0);
			break;
		case "lastweek":
			start.setDate(start.getDate() - 7);
			break;
		case "last10minutes":
			start.setMinutes(start.getMinutes() - 10);
			break;
		case "lastmonth":
			start.setMonth(start.getMonth() - 1);
			break;
		default:
			break;
	}
	return { start, end };
}
