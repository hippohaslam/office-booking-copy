import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AxiosError } from "axios";
import {
  Calendar,
  CtaLink,
  ErrorBanner,
  IconButton,
  IconLink,
  SuccessBanner,
  TabItem,
  Table,
  TabList
} from "../../../components/index.ts";
import { getBookingsForUserBetweenDatesAsync, getUpcomingBookingsAsync } from "../../../services/Apis.ts";
import { MoreIcon, GreenCircleIcon } from "../../../assets";

const Constants = {
  activeTab: "myBookingsActiveTab",
  startDate: "myBookingsStartDate"
};

const loadActiveTab = () => {
  const savedTab = localStorage.getItem(Constants.activeTab);
  if (savedTab) {
    return Number(savedTab);
  }
  return 0;
};

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadError, setLoadError] = useState<AxiosError | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [calendarDates, setCalendarDates] = useState<{ from: Date, to: Date } | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<number>(loadActiveTab());
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [cancelledBooking] = useState<Booking | null>(location.state?.cancelledBooking);

  const { data: upcomingBookings, isLoading, error } = useQuery({
    queryKey: ["upcomingBookings"],
    queryFn: getUpcomingBookingsAsync
  });

  const fetchBookingsBetweenDates = useMutation({
    mutationFn: (dates: { from: Date; to: Date }) => getBookingsForUserBetweenDatesAsync(dates.from, dates.to),
    onSuccess: (data) => {
      setBookings(data);
    },
    onError: (error) => {
      setLoadError(error as AxiosError);
    },
  });

  const handleDateRangeChange = (from: Date, monthStartDate: Date, to: Date) => {
    fetchBookingsBetweenDates.mutate({ from: from, to: to });
    setCalendarDates({ from: from, to: to });
    sessionStorage.setItem(Constants.startDate, `${monthStartDate}`);
  };

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    if (activeTab == 0) {
      window.addEventListener("resize", handleResize);
    }
    else {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab]);

  function getInitialCalendarDate(): Date {
    const date = sessionStorage.getItem(Constants.startDate);
    if (date) {
      return new Date(date);
    }
    else {
      return new Date();
    }
  }

  const handleTabChange = (newIndex: number) => {
    setActiveTab(newIndex);
    localStorage.setItem(Constants.activeTab, String(newIndex));
  };

  const bookingCalendarDays = () => {
    if (bookings) {
      const groupedCells = new Map();

      for (let index = 0; index < bookings.length; index++) {
        const item = bookings[index];
        const date = new Date(item.date).toISOString().split('T')[0];

        if (!groupedCells.has(date)) {
          groupedCells.set(date, []);
        }

        const linkFullLabel = item.bookableObject.name + " - " + item.area.name + " - " + item.location.name;
        const linkLabel = windowWidth < 800 ? item.bookableObject.name : linkFullLabel;
        const ariaLabel = linkFullLabel + " booking details";

        groupedCells.get(date).push(
          <IconLink key={index} label={linkLabel} title={ariaLabel} ariaLabel={ariaLabel} to={`${item.id}/details`} showText={true} showBorder={false} color="navy" iconSrc={GreenCircleIcon} size={windowWidth <= 1250 ? "small" : "regular"} />
        );
      }

      return Array.from(groupedCells.entries()).map(([date, events]) => ({
        date: new Date(date),
        Children: events,
      }));
    } else {
      return [];
    }
  };


  if (loadError) {
    return (
      <ErrorBanner isShown={fetchBookingsBetweenDates.isError} title='Error' errorMessage='Unable to get locations, please refresh the page' allowClose={false} />
    );
  }

  const UpcomingBookingsRows = () => {
    return (
      <>
        {upcomingBookings?.map((booking, index) => (
          <tr key={index} className='booking-row'>
            <td>
              {new Date(booking.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </td>
            <td>{booking.bookableObject.name}</td>
            <td>{booking.area.name}</td>
            <td>{booking.location.name}</td>
            <td>
              <IconButton
                title='Manage booking'
                onClick={() => { navigate(`${booking.id}/details`) }}
                color='navy'
                showBorder={false}
                showText={true}
                iconSrc={MoreIcon}
              />
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div>
      <Helmet>
        <title>My bookings | Hippo Reserve</title>
      </Helmet>

      <SuccessBanner 
        isShown={cancelledBooking != null} 
        title={"Booking cancelled"} 
        description={"Your booking of " + cancelledBooking?.bookableObject.name + " at " + cancelledBooking?.area.name + ", " + cancelledBooking?.location.name + " on " 
          + new Date(cancelledBooking?.date!).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " has been cancelled."} 
      />

      <h1>My bookings</h1>
      <h2>Upcoming</h2>

      <TabList activeTabIndex={activeTab} onChange={handleTabChange}>
        <TabItem label="Calendar view">
          <Calendar calendarCells={bookingCalendarDays()} onDateRangeChange={handleDateRangeChange} dateRange={calendarDates} initialMonthStartDate={getInitialCalendarDate()} />
        </TabItem>
        <TabItem label="Table view">
          {isLoading ? <p>Loading bookings</p> :
            error ? <ErrorBanner isShown title="Error" errorMessage={error.message} allowClose={false} /> :
              upcomingBookings?.length === 0 ? (
                <p>You have no upcoming bookings.</p>
              ) : (
                <>
                  <Table
                    title='Upcoming bookings'
                    columnHeadings={["Date", "Bookable object", "Area", "Location", "Details and action"]}
                    rows={UpcomingBookingsRows()}
                  ></Table>
                </>
              )}
        </TabItem>
      </TabList>
      <CtaLink to='/locations' color='cta-green' withArrow={true} text='Make a new booking' />
    </div>
  );
};

export default MyBookings;
