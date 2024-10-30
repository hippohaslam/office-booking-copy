import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getReportDataAsync, runReportAsync } from "../../../services/Apis";
import { useState } from "react";
import { ActionTable, Breadcrumbs, CtaButton } from "../../../components";

// Use of any in this file is intentional because of the dynamic nature of the data

// using typeof we will determine the type of the field for an input
const fieldTypes = (type: number) => {
  switch (type) {
    case 0:
      return "text";
    case 1:
      return "number";
    case 2:
      return "date";
    default:
      return "text";
  }
};

const Report = () => {
  const { reportId } = useParams();
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ["reporting", reportId],
    queryFn: async () => {
      const response = await getReportDataAsync(reportId as string);
      return response;
    },
    enabled: !!reportId,
  });

  const runReport = useMutation({
    mutationKey: ["reporting", reportId, "run"],
    mutationFn: async (data: Object) => {
      setIsRunning(true);
      const response = await runReportAsync(reportId as string, data as Object);
      return response.data;
    },
    onSuccess: (data) => {
      setIsRunning(false);
      setReportData(data);
    },
  });

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    runReport.mutate(data);
  };

  const breadcrumbItems = [
    { to: "/admin", text: "Admin" }, 
    { to: "/admin/reporting", text: "Reports" },
    { to: "", text: "Report " + reportId }
  ]

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems}/>
      <h1>Report {reportId}</h1>
      <div>
        {data ? (
            <form onSubmit={handleSubmitForm}>
              <h2>{data.name}</h2>
              <p>{data.description}</p>
              <h3>Parameters to run</h3>
              {JSON.parse(data.parameterJson as any).length < 1 && <p>No parameters in this report</p>}
                {JSON.parse(data.parameterJson as any).map((param: any, index: number) => (
                  <div className='standard-inputs' key={index}>
                   <label htmlFor={param.id}>{param.name}</label>
                    <input id={param.id} type={fieldTypes(param.fieldType)} name={param.id} />
                  </div>
               ))}
        <CtaButton text='Run Report' type='submit' color='cta-green' isLoading={isRunning} />
        <CtaButton text='Clear Data' type='button' color='cta-red' onClick={() => setReportData(null)} />
    </form>
        ) : null}
      </div>
      <div>
        {reportData && reportData.length > 0 ? (
          <div>
            <ActionTable
                title="Result Data"
                columnHeadings={Object.keys(reportData[0]).map((key) => key.toString() ?? "")}
                rows={
                  <>
                  {reportData.map((row: any, index: number) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, idx: number) => (
                            <td key={idx}>{value}</td>
                        ))}
                      </tr>
                    ))
                  }
                  </>
                 }
                />
          </div>
        ) : (
          <div>{!reportData ? <p>Run the report to see the data</p> : <p>No data found</p>}</div>
        )}
      </div>
    </div>
  );
};

export default Report;
