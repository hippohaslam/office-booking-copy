import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllBookingWithinAsync, getLocationAreasAsync, getLocationsAsync } from "../../../services/Apis";
import { useEffect, useState } from "react";
import { Area } from "../../../interfaces/Area";
import { CtaButton, ErrorBanner, SuccessBanner } from "../../../components";
import { isNullOrEmpty } from "../../../helpers/StringHelpers";

type BookingQuery = {
  locationId?: number;
  areaId?: number;
  from?: Date;
  to?: Date;
};

const AdminBookings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingQuery, setBookingQuery] = useState<BookingQuery>({
    locationId: undefined,
    areaId: undefined,
    from: new Date(),
    to: new Date(),
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasDeleted, setHasDeleted] = useState<boolean>(false);

  useEffect(() => {
    if (location.state?.bookingQuery) {
      setBookingQuery(location.state.bookingQuery);
    }
    setHasDeleted(location.state?.deleted ?? false);
  }, [location.state]);

  useEffect(() => {
    if (bookingQuery.locationId) {
      getAreas.mutate(bookingQuery.locationId.toString());
    }
  }, [bookingQuery.locationId]);

  const { data: locationData } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: () => getLocationsAsync(true)(),
  });

  const getAreas = useMutation({
    mutationFn: (locationId: string) => getLocationAreasAsync(true)(+locationId),
    onSuccess: (areaData: Area[]) => {
      setAreas(areaData);
    },
    onError: () => setErrors(["Error fetching areas"]),
  });

  const getBookings = useMutation({
    mutationFn: () => getAllBookingWithinAsync(bookingQuery!.locationId!, bookingQuery!.areaId!, bookingQuery!.from!, bookingQuery!.to!),
    onSuccess: (adminBookings: AdminBooking[]) => {
      setBookings(adminBookings);
      setErrors([]);
    },
    onError: () => setErrors(["Error fetching bookings"]),
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBookingQuery({ ...bookingQuery, locationId: +e.target.value });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBookingQuery({ ...bookingQuery, areaId: +e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNullOrEmpty(e.target.value)) return;
    setBookingQuery({ ...bookingQuery, [e.target.name]: new Date(e.target.value) });
  };

  const invalidForm = !bookingQuery?.locationId || !bookingQuery?.areaId || !bookingQuery?.from || !bookingQuery?.to;
  const handleGetBookings = () => {
    if (invalidForm) {
      // TODO: Some form of error handling. Tell the user they are missing something
      return;
    }
    getBookings.mutate();
  };

  const handleDeleteBookingClicked = (booking: AdminBooking) =>
    navigate(`/admin/bookings/${booking.id}/delete`, { state: { booking, bookingQuery } });

  const formatDateYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <h1>Admin Bookings</h1>
      <div>
        <SuccessBanner isShown={hasDeleted} title='Successfully deleted'></SuccessBanner>
        {errors.map((error) => (
          <ErrorBanner isShown={errors.length > 0} title='Errors' key={error} errorMessage={error} allowClose={false}></ErrorBanner>
        ))}
      </div>
      <div>
        <div className='standard-inputs'>
          <label htmlFor='from'>From:</label>
          <input id='from' type='date' name='from' value={formatDateYYYYMMDD(bookingQuery.from!)} onChange={handleDateChange} />
        </div>

        <div className='standard-inputs'>
          <label htmlFor='to'>To:</label>
          <input id='to' type='date' name='to' value={formatDateYYYYMMDD(bookingQuery.to!)} onChange={handleDateChange} />
        </div>
      </div>

      <div className='standard-inputs'>
        <label htmlFor='location'>Location:</label>
        <select id='location' name='location' aria-label='Location:' onChange={handleLocationChange} value={bookingQuery.locationId ?? ""}>
          <option value=''>Select a location</option>
          {locationData?.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className='standard-inputs'>
        <label htmlFor='area'>Area:</label>
        <select id='area' name='area' aria-label='Area:' onChange={handleAreaChange} value={bookingQuery.areaId ?? ""}>
          <option value=''>Select an area</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <CtaButton color='cta-green' type='button' text='Get bookings' onClick={handleGetBookings} disabled={invalidForm} />
      <div>
        {getBookings.isSuccess ? (
          bookings.length > 0 ? (
            <table className='standard-table'>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Date</th>
                  <th>Booked by</th>
                  <th>Booking name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.date.toString()}</td>
                    <td>{booking.bookedBy}</td>
                    <td>{booking.bookableObject.name}</td>
                    <td>
                      <button onClick={() => handleDeleteBookingClicked(booking)}>Delete booking</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bookings found.</p>
          )
        ) : (
          <p>Fill in the form to get results</p>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
