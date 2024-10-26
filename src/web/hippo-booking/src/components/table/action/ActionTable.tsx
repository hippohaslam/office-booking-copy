import { ReactNode } from "react";
import "./ActionTable.scss";

type ActionTableProps = {
    title: string;
    columnHeadings: string[];
    rows: ReactNode;
};

const ActionTable = ({title, columnHeadings, rows}: ActionTableProps) => {
    return (
        <table className="action-table">
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

export default ActionTable;