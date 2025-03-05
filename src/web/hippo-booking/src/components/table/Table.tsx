import { ReactNode } from "react";
import "./Table.scss";

type TableProps = {
    title: string;
    columnHeadings: string[];
    rows: ReactNode;
    headerVisuallyHidden? : boolean;
};

const Table = ({title, columnHeadings, rows, headerVisuallyHidden = false}: TableProps) => {
    return (
        <table className={headerVisuallyHidden ? "standard-table table-header-hidden" : "standard-table"}>
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