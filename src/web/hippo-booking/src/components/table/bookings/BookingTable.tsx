import { CtaButton } from "../../buttons/CtaButton";
import "./BookingTable.scss";

type BookingTableProps = {
  date: string;
  bookings: Booking[];
  onClick: (booking: Booking) => void;
};

const BookingTable = ({ date, bookings, onClick }: BookingTableProps) => {
  return (
    <div>
      <table className='bookings-table'>
        <caption>{date}</caption>
        <thead>
          <tr className='visually-hidden'>
            <th>Bookable object</th>
            <th>Area</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={index} className='booking-row'>
              <td>{booking.bookableObject.name}</td>
              <td>{booking.area.name}</td>
              <td>{booking.location.name}</td>
              <td>
                <CtaButton onClick={() => onClick(booking)} color="cta-grey" text="Cancel booking"/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
