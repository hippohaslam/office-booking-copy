import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ActionTile, ActionTileList } from "../../../components/tile/ActionTile";
import { ErrorBanner } from "../../../components";
import { Area } from "../../../interfaces/Area";

const BookingAreas = () => {
    // prefetch to see if we can skip this page. It works!! a bit abstracty but does the job
    const {areaData, locationData} = useLoaderData() as { areaData: Area[], locationData: BookingLocation };
    const { locationId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (areaData && areaData.length === 1) {
            navigate(`/locations/${locationId}/areas/${areaData[0].id}`);
        }
    }, [areaData, locationId, navigate]);

    if (areaData.length === 0) {
        return (
            <div>
                <ErrorBanner text="Oops. No areas found for this location"/>
                <Link to="/locations">Back to Choose a location</Link>
            </div>
        )
    }

    const listItems = 
    areaData?.map(area => (
    <ActionTile 
      title={area.name} 
      primaryLink={{show: true, text: "Book in this area", to: `/locations/${locationId}/areas/${area.id}`}}
      secondaryLink={{show: false}} 
    />
    )) || [];

    return (
        <div>
            <Link to="/locations">Back to Choose a location</Link>
            <h1>{locationData.name}</h1>
            <h2>What would you like to book?</h2>
            <ActionTileList listItems={listItems} />
        </div>
    )
};

export default BookingAreas;