import "./BookingCard.scss";

type BookingCardProps = {
  date: Date;
  bookableObjectName?: string;
  areaName: string;
  locationName: string;
  elementId?: string;
  color?: "hippo-brand-grey" | "hippo-brand-bluey-grey" | "hippo-brand-light-grey";
};

const BookingCardStacked = ({
  date,
  bookableObjectName = undefined,
  areaName,
  locationName,
  elementId,
  color = "hippo-brand-grey",
}: BookingCardProps) => {
  if (date === undefined) {
    return;
  }

  const formattedDateTime = new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className={"booking-card " + "booking-card-" + color} id={elementId}>
      <ul>
        <li aria-label='date'>{formattedDateTime}</li>
        {bookableObjectName != undefined && (
            <li className='bookable-object-item' aria-label='space'>
              {bookableObjectName}
            </li>
        )}
        <li aria-label='area'>{areaName}</li>
        <li aria-label='location'>{locationName}</li>
      </ul>
    </div>
  );
};

export default BookingCardStacked;
