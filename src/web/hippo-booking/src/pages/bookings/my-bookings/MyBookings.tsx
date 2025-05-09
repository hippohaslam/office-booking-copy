import { JSX, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { AxiosError } from "axios";
import { Calendar, CtaLink, ErrorBanner, IconButton, IconLink, SuccessBanner, TabItem, Table, TabList } from "../../../components";
import { getBookingsForUserBetweenDatesAsync, getUpcomingBookingsAsync, getWaitListBookingsForUserAsync } from "../../../services/Apis.ts";
import { MoreIcon, GreenCircleIcon, PendingIcon } from "../../../assets";
import { toLocaleDateUk } from "../../../helpers/DateHelpers.ts";
import { useFeatureFlags } from "../../../contexts/FeatureFlagsContext";

const Constants = {
  activeTab: "myBookingsActiveTab",
  startDate: "myBookingsStartDate",
};

const loadActiveTab = () => {
  const savedTab = localStorage.getItem(Constants.activeTab);
  if (savedTab) {
    return Number(savedTab);
  }
  return 0;
};

type CalendarDay = {
  date: Date;
  Children: JSX.Element[];
};

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadError, setLoadError] = useState<AxiosError | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [calendarDates, setCalendarDates] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<number>(loadActiveTab());
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [cancelledBooking] = useState<Booking | null>(location.state?.cancelledBooking);
  const [cancelledWaitListBooking] = useState<WaitingListBookingResponse | null>(location.state?.cancelledWaitListBooking);
  const { waitingListFeature } = useFeatureFlags();

  const {
    data: upcomingBookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["upcomingBookings"],
    queryFn: getUpcomingBookingsAsync,
  });

  const {
    error: waitingListDataError,
    isLoading: waitingListLoading,
    data: waitingListData,
  } = useQuery({
    queryKey: ["waitingList"],
    queryFn: () => getWaitListBookingsForUserAsync(),
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
    } else {
      window.removeEventListener("resize", handleResize);
    }
  }, [activeTab]);

  const getInitialCalendarDate = () => new Date(sessionStorage.getItem(Constants.startDate) || new Date().toString());

  const handleTabChange = (newIndex: number) => {
    setActiveTab(newIndex);
    localStorage.setItem(Constants.activeTab, String(newIndex));
  };

  const generateCalendarDays = (data: any[] | null | undefined, mapItemToJSX: (item: any, index: number) => JSX.Element): CalendarDay[] => {
    if (!data) return [];

    // Group items by date
    const groupedDays: Record<string, JSX.Element[]> = data.reduce(
      (acc, item, index) => {
        const dateKey = new Date(item.date || item.dateToBook).toISOString().split("T")[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        acc[dateKey].push(mapItemToJSX(item, index));
        return acc;
      },
      {} as Record<string, JSX.Element[]>,
    );

    // Convert groupedDays back to an array
    return Object.entries(groupedDays).map(([date, Children]) => ({
      date: new Date(date),
      Children,
    }));
  };

  const bookingCalendarDays = (): CalendarDay[] => {
    return generateCalendarDays(bookings, (item, index) => {
      const linkFullLabel = `${item.bookableObject.name} - ${item.area.name} - ${item.location.name}`;
      const linkLabel = windowWidth < 800 ? item.bookableObject.name : linkFullLabel;
      const ariaLabel = `${linkFullLabel} booking details`;

      return (
        <IconLink
          key={index}
          label={linkLabel}
          title={ariaLabel}
          ariaLabel={ariaLabel}
          to={`${item.id}/details`}
          showText={true}
          showBorder={false}
          color='navy'
          iconSrc={GreenCircleIcon}
          size={windowWidth <= 1250 ? "small" : "regular"}
        />
      );
    });
  };

  const waitingListCalendarDays = (): CalendarDay[] => {
    if (!waitingListFeature) return [];
    
    return generateCalendarDays(waitingListData, (item, index) => {
      const linkFullLabel = `${item.area.name} - ${item.location.name}`;
      const linkLabel = windowWidth < 800 ? item.area.name : linkFullLabel;
      const ariaLabel = `${linkFullLabel} - Waiting list place details`;

      return (
        <IconLink
          key={index}
          label={linkLabel}
          title={ariaLabel}
          ariaLabel={ariaLabel}
          to={`/waiting-list/${item.id}`}
          showText={true}
          showBorder={false}
          color='navy'
          iconSrc={PendingIcon}
          size={windowWidth <= 1250 ? "small" : "regular"}
        />
      );
    });
  };

  const combinedCalendarDays = (): CalendarDay[] => {
    const allDays: CalendarDay[] = [...bookingCalendarDays(), ...waitingListCalendarDays()];

    // Use reduce to group by date
    const groupedDays = allDays.reduce(
      (acc, { date, Children }) => {
        const dateKey = date.toISOString().split("T")[0]; // Use ISO string for unique keys
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(...Children);
        return acc;
      },
      {} as Record<string, JSX.Element[]>,
    );

    // Convert groupedDays back to an array
    return Object.entries(groupedDays).map(([date, Children]) => ({
      date: new Date(date),
      Children,
    }));
  };

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
                onClick={() => {
                  navigate(`${booking.id}/details`);
                }}
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

  const UpcomingWaitListRows = () => {
    return (
      <>
        {waitingListData?.map((waitingListRequest, index) => (
          <tr key={index} className='booking-row'>
            <td>
              {new Date(waitingListRequest.dateToBook).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </td>
            <td>{waitingListRequest.area.name}</td>
            <td>{waitingListRequest.location.name}</td>
            <td>
              <IconButton
                title='Mange waiting list place'
                onClick={() => {
                  navigate(`/waiting-list/${waitingListRequest.id}`);
                }}
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

  const SuccessBannerMessage = ({
    cancelledBooking,
    cancelledWaitListBooking,
  }: {
    cancelledBooking: Booking | null;
    cancelledWaitListBooking: WaitingListBookingResponse | null;
  }) => {
    if (cancelledBooking) {
      return (
        <SuccessBanner
          isShown
          title='Booking cancelled'
          description={`Your booking of ${cancelledBooking.bookableObject.name} at ${cancelledBooking.area.name}, ${cancelledBooking.location.name} on ${toLocaleDateUk(
            cancelledBooking.date!,
          )} has been cancelled.`}
        />
      );
    }

    if (cancelledWaitListBooking) {
      return (
        <SuccessBanner
          isShown
          title='Waiting list booking cancelled'
          description={`Your waiting list request of ${cancelledWaitListBooking.area.name}, ${cancelledWaitListBooking.location.name} on ${toLocaleDateUk(
            cancelledWaitListBooking.dateToBook!,
          )} has been cancelled.`}
        />
      );
    }

    return null;
  };

  const renderTableViewContent = () => {
    if (isLoading || waitingListLoading) {
      return <p>Loading bookings</p>;
    }

    if (error) {
      return <ErrorBanner isShown title='Error' errorMessage={error.message} allowClose={false} />;
    }

    if (upcomingBookings?.length === 0 && (!waitingListFeature || waitingListData?.length === 0)) {
      return <p>You have no upcoming bookings{waitingListFeature ? ' or in the waiting list' : ''}.</p>;
    }

    return (
      <>
        <Table
          title='Upcoming bookings'
          columnHeadings={["Date", "Bookable object", "Area", "Location", "Details and action"]}
          rows={UpcomingBookingsRows()}
        />
        {waitingListFeature && waitingListData && waitingListData.length > 0 && (
          <>
            <br />
            <br />
            <Table
              title='Waiting list places'
              columnHeadings={["Date", "Area", "Location", "Details and action"]}
              rows={UpcomingWaitListRows()}
            />
          </>
        )}
      </>
    );
  };

  if (loadError || waitingListDataError) {
    return (
      <ErrorBanner
        isShown={fetchBookingsBetweenDates.isError}
        title='Error'
        errorMessage='Unable to get booking data, please refresh the page'
        allowClose={false}
      />
    );
  }

  return (
    <div>
      <Helmet>
        <title>My bookings | Hippo Reserve</title>
      </Helmet>

      <SuccessBannerMessage cancelledBooking={cancelledBooking} cancelledWaitListBooking={cancelledWaitListBooking} />

      <h1>My bookings</h1>
      <h2>Upcoming</h2>

      <TabList activeTabIndex={activeTab} onChange={handleTabChange}>
        <TabItem label='Calendar view'>
          <Calendar
            calendarCells={combinedCalendarDays()}
            onDateRangeChange={handleDateRangeChange}
            dateRange={calendarDates}
            initialMonthStartDate={getInitialCalendarDate()}
          />
        </TabItem>
        <TabItem label='Table view'>{renderTableViewContent()}</TabItem>
      </TabList>
      <CtaLink to='/locations' color='cta-green' withArrow={true} text='Make a new booking' />
    </div>
  );
};

export default MyBookings;
