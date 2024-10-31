import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Table from "./Table";

test("Action table should display correctly", () => {
    //Arrange
    const rows = () => {
        return (
            <>
                <tr>
                    <td>Test name 1</td>
                    <td>Test location 1</td>
                    <td>23/10/2024</td>
                    <td><button onClick={() => {}}>Test button</button></td>
                </tr>
                <tr>
                    <td>Test name 2</td>
                    <td>Test location 2</td>
                    <td>24/10/2024</td>
                    <td><button onClick={() => {}}>Test button</button></td>
                </tr>   
            </> 
        )
    }
    render(
        <Table title="Test table" columnHeadings={["Name", "Location", "Date", "Actions"]} rows={rows()}/>
    );

    //Assert
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const validateRowCells = (rowIndex : number, expectedContent : string[]) => {
        const cells = table.querySelectorAll("tr")[rowIndex].querySelectorAll("td");
        cells.forEach((cell, index) => {
            expect(cell).toHaveTextContent(expectedContent[index]);
        });
    };
    
    validateRowCells(0, ["Name", "Location", "Date", "Actions"]);
    validateRowCells(1, ["Test name 1", "Test location 1", "23/10/2024", "Test button"]);
    validateRowCells(2, ["Test name 2", "Test location 2", "24/10/2024", "Test button"]); 
});