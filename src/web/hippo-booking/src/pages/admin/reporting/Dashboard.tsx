import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { getReportListAsync } from "../../../services/Apis";
import { Link } from "react-router-dom";
import "./ReportingDashboard.scss";
import { Breadcrumbs } from "../../../components";

const Reporting = () => {
  const { data } = useQuery({
    queryKey: ["reporting"],
    queryFn: async () => {
      const response = await getReportListAsync();
      return response;
    },
  });
  const breadcrumbItems = [
    { to: "/admin", text: "Admin" }, 
    { to: "", text: "Reports" }
  ];
  return (
    <div>
      <Helmet>
        <title>Reports | Hippo Reserve</title>
      </Helmet>
      <Breadcrumbs items={breadcrumbItems}/>
      <h1>Reports</h1>
      <ul className="admin-card-list">
      {data?.map((report: ReportingList) => (
        <li className='admin-card'>
            <h2>{report.name}</h2>
            <p>{report.description}</p>
            <Link to={`/admin/reporting/${report.id}`}>View report</Link>
        </li>
        ))}
      </ul>
    </div>
  );
};

export default Reporting;
