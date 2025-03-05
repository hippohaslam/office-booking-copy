import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { BrowserRouter, Link } from "react-router-dom";
import Calendar, { calendarCellProps } from "./Calendar";
import userEvent from "@testing-library/user-event";

const jan2025Dates = [
    ["30", "31", "1 Jan", "2", "3" ], 
    ["6", "7", "8", "9", "10"], 
    ["13", "14", "15", "16", "17"], 
    ["20", "21", "22", "23", "24"], 
    ["27", "28", "29", "30", "31"]
];

const calendarRows = () => {
    const calendarTable = screen.getByRole("table");
    const tableBody = calendarTable.querySelector("tbody");
    return tableBody?.querySelectorAll("tr");
};

test("Empty calendar is displayed correctly", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <Calendar calendarCells={[]} dateRange={undefined} initialMonthStartDate={new Date(2025, 0, 1)} onDateRangeChange={() => {}} />
        </BrowserRouter>
    );

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Assert
    const calendarTitle = screen.queryByRole("heading");
    expect(calendarTitle).toHaveTextContent("January 2025");
    
    const previousButton = screen.getByRole("button", {name: "Previous month"});
    const nextButton = screen.getByRole("button", {name: "Next month"});
    expect(previousButton).toBeVisible();
    expect(nextButton).toBeVisible();

    const calendarTable = screen.getByRole("table");
    expect(calendarTable).toBeVisible();

    const calendarHeaders = calendarTable.querySelector("thead");
    const headerCells = calendarHeaders?.querySelectorAll("th");
    expect(headerCells).toHaveLength(5);

    for (let index = 0; index < headerCells!.length; index++) {
        const cell = headerCells?.item(index);
        expect(cell).toHaveTextContent(weekdays[index]);
    }

    const rows = calendarRows();
    expect(rows).toHaveLength(5);
    for (let index = 0; index < rows!.length; index++) {
        const row = rows?.item(index);
        const cells = row?.querySelectorAll("td");
        const weekDates = jan2025Dates[index];
        for (let index = 0; index < cells!.length; index++) {
            const cell = cells?.item(index);
            expect(cell).toHaveTextContent(weekDates[index]);
        };
    };
});

const calendarCellElements : calendarCellProps[] = [
    {
        date: new Date(2024, 11, 30),
        Children: <strong>Test 1</strong>
    },
    {
        date: new Date(2025, 0, 1),
        Children: <strong>Test 2</strong>
    },
    {
        date: new Date(2025, 0, 20),
        Children: <><button>Test 3a</button><button>Test 3b</button></>
    },
    {
        date: new Date(2025, 0, 25),
        Children: <button>Test 4 - Not shown</button>
    },
    {
        date: new Date(2025, 1, 1),
        Children: <Link to={''}>Test 6</Link>
    }
]; 

test("Should show single element for date in range", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <Calendar calendarCells={calendarCellElements} dateRange={undefined} initialMonthStartDate={new Date(2025, 0, 1)} onDateRangeChange={() => {}} />
        </BrowserRouter>
    );

    // Assert
    expect(calendarRows()?.item(0).querySelectorAll("td").item(0).querySelector("strong")).toHaveTextContent("Test 1");
    expect(calendarRows()?.item(0).querySelectorAll("td").item(2).querySelector("strong")).toHaveTextContent("Test 2");
});

test("Should show multiple elements for valid date in range", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <Calendar calendarCells={calendarCellElements} dateRange={undefined} initialMonthStartDate={new Date(2025, 0, 1)} onDateRangeChange={() => {}} />
        </BrowserRouter>
    );

    // Assert
    const twentyJanButtons = calendarRows()?.item(3).querySelectorAll("td").item(0).querySelectorAll("button");
    expect(twentyJanButtons).toHaveLength(2);
    expect(twentyJanButtons?.item(0)).toHaveTextContent("Test 3a");
    expect(twentyJanButtons?.item(1)).toHaveTextContent("Test 3b");
});

test("Should not show elements for dates at weekends", async () => {
    // Arrange
    render(
        <BrowserRouter>
            <Calendar calendarCells={calendarCellElements} dateRange={undefined} initialMonthStartDate={new Date(2025, 0, 1)} onDateRangeChange={() => {}} />
        </BrowserRouter>
    );

    // Assert
    const testFourButton = screen.queryAllByRole("button", {name: "Test 4 - Not shown"});
    expect(testFourButton).toHaveLength(0);
});

test("Should not show elements for dates outside date range", async () => {
    // Arrange 
    render(
        <BrowserRouter>
            <Calendar calendarCells={calendarCellElements} dateRange={undefined} initialMonthStartDate={new Date(2025, 0, 1)} onDateRangeChange={() => {}} />
        </BrowserRouter>
    );

    // Assert
    const testFourButton = screen.queryAllByRole("link", {name: "Test 6"});
    expect(testFourButton).toHaveLength(0);
});

const navigationTestCases = [
    {
        control: "Next", 
        expectedHeading: "February 2025",
        expectedDates: [
            ["3", "4", "5", "6", "7"],
            ["10", "11", "12", "13", "14"],
            ["17", "18", "19", "20", "21"],
            ["24", "25", "26", "27", "28"]
        ]
    },
    {
        control: "Previous", 
        expectedHeading: "December 2024",
        expectedDates: [
            ["2", "3", "4", "5", "6"],
            ["9", "10", "11", "12", "13"],
            ["16", "17", "18", "19", "20"],
            ["23", "24", "25", "26", "27"],
            ["30", "31", "1 Jan", "2", "3"]
        ]
    },
]

test.each(navigationTestCases)("Should show the correct dates shown after navigation", async ({control, expectedHeading, expectedDates}) => {
    // Arrange
    const onChange = vi.fn();

    render(
        <BrowserRouter>
            <Calendar calendarCells={calendarCellElements} dateRange={undefined} initialMonthStartDate={new Date(2025, 0, 1)} onDateRangeChange={onChange} />
        </BrowserRouter>
    );

    // Act
    const nextButton = screen.getByRole("button", { name: control + " month" });
    await userEvent.click(nextButton);

    // Assert
    expect(onChange).toHaveBeenCalled();

    const calendarTitle = screen.queryByRole("heading");
    expect(calendarTitle).toHaveTextContent(expectedHeading);

    const rows = calendarRows();
    expect(rows).toHaveLength(expectedDates.length);
    for (let index = 0; index < rows!.length; index++) {
        const row = rows?.item(index);
        const cells = row?.querySelectorAll("td");
        const weekDates = expectedDates[index];
        for (let index = 0; index < cells!.length; index++) {
            const cell = cells?.item(index);
            expect(cell).toHaveTextContent(weekDates[index]);
        };
    };
});