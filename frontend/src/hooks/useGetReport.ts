import { getReport } from "../api/endpoints";
import { useAuth } from "../components/providers/AuthProvider";

function useGetReport() {
	const auth = useAuth();

	const createReport = async (date: string[]) => {
		if (auth.user?.uuid) {
			await getReport(auth.user.uuid, date);
		}
	};

	return { createReport };
}

export default useGetReport;
