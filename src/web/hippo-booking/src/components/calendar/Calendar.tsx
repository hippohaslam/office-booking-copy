import { useEffect, useState } from "react";
import "./Calendar.scss";
import IconButton from "../buttons/icon/IconButton";
import { CtaArrowLeftNavy, CtaArrowRightNavy } from "../../assets";
import { useWindowSize } from "../../hooks/WindowSizeHook.tsx";

type calendarCellProps = {
    date: Date;
    backgroundColor?: string;
    Children: React.ReactNode;
};

type calendarProps = {
    calendarCells: calendarCellProps[];
    dateRange: {from: Date, to: Date} | undefined;
    initialMonthStartDate: Date;
    onDateRangeChange: (from: Date, monthStartDate: Date, to: Date) => void;
};

function isDateMatch(arr: calendarCellProps[], date: Date) {
    return arr.find((el) => {
        const isMatch =
            el.date.getDate() === date.getDate() &&
            el.date.getMonth() === date.getMonth() &&
            el.date.getFullYear() === date.getFullYear();
        return isMatch;
    });
};

function getDaysToDisplay(currentYear: number, currentMonth: number): Date[][] {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const weekdayOfFirstDay = firstDayOfMonth.getDay();
    const firstVisibleDate = new Date(firstDayOfMonth);
    firstVisibleDate.setDate(firstDayOfMonth.getDate() - ((weekdayOfFirstDay + 6) % 7));

    // Generate all weekdays (Mon-Fri) within the grid
    // Gets 41 days - accounting for the longest possible month including the weekends
    const days: Date[] = Array.from({ length: 41 }, (_, index) => {
        const currentDate = new Date(firstVisibleDate);
        currentDate.setDate(currentDate.getDate() + index);
        return currentDate;
    }).filter(date => date.getDay() !== 6 && date.getDay() !== 0) // Filters out the weekends

    // Group days into weeks
    const weeks = Array.from({ length: Math.ceil(days.length / 5) }, (_, weekIndex) =>
        days.slice(weekIndex * 5, weekIndex * 5 + 5)
    );

    // Filter out weeks without any dates in the current month
    const validWeeks = weeks.filter(week => week.some(day => day.getMonth() === currentMonth));

    return validWeeks;
};

const Calendar = ({ calendarCells, onDateRangeChange, initialMonthStartDate }: calendarProps) => {
    const [calendarWeeks, setCalendarWeeks] = useState<Date[][]>([]);
    const [currentMonthStartDate, setCurrentMonthStartDate] = useState<Date>(initialMonthStartDate);
    const [today] = useState<Date>();
    const { windowWidth } = useWindowSize();

    const monthStrings = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const setUpCalendar = (date: Date) => {
        const weeks = getDaysToDisplay(date.getFullYear(), date.getMonth());
        const firstVisibleDate = weeks[0][0];
        const lastWeek = weeks[weeks.length - 1];
        const lastVisibleDate = lastWeek[lastWeek.length - 1];
    
        if (onDateRangeChange) {
            onDateRangeChange(firstVisibleDate, date, lastVisibleDate);
        }

        setCalendarWeeks(weeks);
    };

    useEffect(() => {
        setUpCalendar(currentMonthStartDate)
    }, [currentMonthStartDate]);

    const CalendarDays = () => {
        return (
            <>
                {calendarWeeks.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                        {week.map((day, dayIndex) => (
                            <td key={dayIndex} 
                            className={`calendar-day${day.toDateString() === new Date().toDateString() ? " current" : ""}
                                ${today?.toDateString() === day.toDateString() ? " current" : ""}`}>
                                <div className="calendar-day-content">
                                    <p className="calendar-day-date">
                                        {day.getDate()}{" "}
                                        {day.getDate() === 1
                                            ? monthStrings[day.getMonth()].slice(0, 3)
                                            : ""}
                                    </p>
                                    {isDateMatch(calendarCells, day)?.Children}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </>
        );
    };

    const HandleChangeMonth = (updateBy: number) => {
        const updatedDate = new Date(currentMonthStartDate);
        updatedDate.setMonth(currentMonthStartDate.getMonth() + updateBy);
        setCurrentMonthStartDate(updatedDate);
    };

    const weekdays = () => {
        if (windowWidth > 768) {
            return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        }
        else {
            return ["Mon", "Tues", "Wed", "Thur", "Fri"];
        };
    };

    return (
        <div className="calendar-container">
            <div className="icon-button-group">
                <IconButton
                    title="Previous month"
                    showText={false}
                    onClick={() => HandleChangeMonth(-1)}
                    showBorder={false}
                    color="navy"
                    iconSrc={CtaArrowLeftNavy}
                />
                <IconButton
                    title="Next month"
                    showText={false}
                    onClick={() => HandleChangeMonth(1)}
                    showBorder={false}
                    color="navy"
                    iconSrc={CtaArrowRightNavy}
                />
                <h3 style={{ marginBottom: "0" }} aria-live="polite">
                    {monthStrings[currentMonthStartDate.getMonth()] + " " + currentMonthStartDate.getFullYear()}
                </h3>
            </div>
            <table className="calendar" aria-labelledby="calendar-caption">
                <caption style={{ visibility: "hidden" }} id="calendar-caption">
                {"bookings calendar for " + monthStrings[currentMonthStartDate.getMonth()] + " " + currentMonthStartDate.getFullYear()}
                </caption>
                <thead>
                    <tr>
                        {weekdays().map(day => (
                            <th key={day}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{CalendarDays()}</tbody>
            </table>
        </div>
    );
};

export default Calendar;
export type { calendarCellProps };
