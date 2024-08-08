import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ActionTile, ActionTileList } from "../../../components/tile/ActionTile";
import { ErrorBanner } from "../../../components";

const BookingAreas = () => {
    // prefetch to see if we can skip this page. It works!! a bit abstracty but does the job
    const loaderData = useLoaderData() as Area[];
    const { locationId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (loaderData && loaderData.length === 1) {
            navigate(`/locations/${locationId}/areas/${loaderData[0].id}`);
        }
    }, [loaderData, locationId, navigate]);

    if (loaderData.length === 0) {
        return (
            <div>
                <ErrorBanner text="Oops. No areas found for this location"/>
                <Link to="/locations">Back to Choose a location</Link>
            </div>
        )
    }

    const listItems = 
    loaderData?.map(area => (
    <ActionTile 
      title={area.name} 
      primaryLink={{show: true, text: "Book in this area", to: `/locations/${locationId}/areas/${area.id}`}}
      secondaryLink={{show: false}} 
    />
    )) || [];

    return (
        <div>
            <Link to="/locations">Back to Choose a location</Link>
            <h1>What would you like to book?</h1>
            <ActionTileList listItems={listItems} />
        </div>
    )
};

export default BookingAreas;