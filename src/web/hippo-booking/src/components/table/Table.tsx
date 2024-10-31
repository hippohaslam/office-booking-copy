import { ReactNode } from "react";
import "./Table.scss";

type TableProps = {
    title: string;
    columnHeadings: string[];
    rows: ReactNode;
};

const Table = ({title, columnHeadings, rows}: TableProps) => {
    return (
        <table className="standard-table">
            <caption>{title}</caption>
            <thead>
                <tr>
            {columnHeadings.map((heading) => (<th key={heading}>{heading}</th>))}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    )
};

export default Table;