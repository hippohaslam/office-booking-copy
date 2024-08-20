import { render } from "@testing-library/react"
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import BookingTable from "./BookingTable"

const bookings : Booking[] = [
    {
    id: 1,
    date: new Date(),
    location: {
        name: "Location 1",
        id: 1,
        floorPlanJson: "[]",
        bookableObjects: [
            {id: 1, name: "Desk 1"}
        ]
    },
    bookableObject: {id: 1, name: "Desk 1"},
    area: {
        id: 2,
        name: "Area 1",
        locationId: 1,        
    }},
    {
        id: 1,
        date: new Date(),
        location: {
            name: "Location 1",
            id: 1,
            floorPlanJson: "[]",
            bookableObjects: [
                {id: 1, name: "Desk 2"}
            ]
        },
        bookableObject: {id: 1, name: "Desk 2"},
        area: {
            id: 1,
            name: "Area 1",
            locationId: 1,        
        }},
]

test("Table has correct content", async () => {
    // Arrange
    render(<BookingTable date="Monday 5 August 2024" bookings={bookings} onClick={() => {}}/>)

    // Assert
    const table = screen.getByRole("table");

    const caption = table.querySelector("caption");
    expect(caption).toHaveTextContent("Monday 5 August 2024");

    const tableRows = table.querySelectorAll("tbody tr");
    expect(tableRows).toHaveLength(2);

    const expectedRows : string[][] = [
       [ "Desk 1", "Area 1", "Location 1", "Cancel booking"],
       [ "Desk 2", "Area 1", "Location 1", "Cancel booking"]
    ]

    tableRows.forEach((row, rowIndex) => {
        const actualCells = row.querySelectorAll("td");
        const expectedCells = expectedRows[rowIndex];
        expect(actualCells).toHaveLength(expectedCells.length);
        actualCells.forEach((cell, cellIndex) => {
            expect(cell.textContent).toBe(expectedCells[cellIndex])
        })
    })
})

test("OnClick is called once when button is clicked", async () => {
    // Arrange
    const onClick = vi.fn();

    render(<BookingTable date="Monday 5 August 2024" bookings={bookings} onClick={onClick}/>)

    // Act
    const cancelButton = screen.getAllByText("Cancel booking")[0];
    await userEvent.click(cancelButton);

    // Assert
    expect(onClick).toHaveBeenCalledOnce();
})