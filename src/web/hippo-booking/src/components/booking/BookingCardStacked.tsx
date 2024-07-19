import "./BookingCard.scss"

type BookingCardProps = {
    date: Date;
    bookableObjectName : string;
    areaName: string;
    locationName: string;
};

const BookingCardStacked = ({date, bookableObjectName, areaName, locationName} : BookingCardProps) => {

    if (date === undefined){
        return;
    }

    const formattedDateTime = new Date(date).toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});


    return (
    <div className="booking-card">
        <table>
            <li aria-label='date'>{formattedDateTime}</li>
            <li className='bookable-object-item' aria-label='space'>{bookableObjectName}</li>
            <li aria-label='area'>{areaName}</li>
            <li area-label='location'>{locationName}</li>
        </table>
    </div>
    )
}

export default BookingCardStacked