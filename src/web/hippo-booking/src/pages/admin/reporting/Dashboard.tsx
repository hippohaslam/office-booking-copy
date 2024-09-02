import { useQuery } from "@tanstack/react-query";
import { getReportListAsync } from "../../../services/Apis";
import { Link } from "react-router-dom";
import "./ReportingDashboard.scss";

const Reporting = () => {
  const { data } = useQuery({
    queryKey: ["reporting"],
    queryFn: async () => {
      const response = await getReportListAsync();
      return response;
    },
  });
  return (
    <div>
      <h1>Reports</h1>
      <ul className="reports-list">
        {data?.map((report: ReportingList) => (
          <li key={report.id}>
            <Link to={`/admin/reporting/${report.id}`}>{report.name}</Link>
            <br />
            <small>{report.description}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reporting;
