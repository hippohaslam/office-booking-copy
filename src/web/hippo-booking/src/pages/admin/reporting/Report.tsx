import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getReportDataAsync, runReportAsync } from "../../../services/Apis";
import { useState } from "react";

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
      const response = await runReportAsync(reportId as string, data as Object);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("return data", data);
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

  return (
    <div>
      <h1>Report {reportId}</h1>
      <div>
        {data ? (
          <form onSubmit={handleSubmitForm}>
            <h2>{data.name}</h2>
            <p>{data.description}</p>
            <h3>Parameters to run</h3>
            {JSON.parse(data.parameterJson as any).length < 1 && <p>No parameters in this report</p>}
            <ul>
              {JSON.parse(data.parameterJson as any).map((param: any, index: number) => (
                  <li key={index}>
                    <label>
                      {param.name}:
                    </label>
                  <input type={fieldTypes(param.fieldType)} name={param.id} />
                </li>
              ))}
            </ul>
            <button type='submit'>Run</button>
            <button type='button' onClick={() => setReportData(null)}>
              Clear
            </button>
          </form>
        ) : null}
      </div>
      <div>
        {reportData && reportData.length > 0 ? (
          <div>
            <h3>Result Data</h3>
            <table id='report-data-table' className='table-striped'>
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row: any, index: number) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, idx: number) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>{!reportData ? <p>Run the report to see the data</p> : <p>No data found</p>}</div>
        )}
      </div>
    </div>
  );
};

export default Report;
