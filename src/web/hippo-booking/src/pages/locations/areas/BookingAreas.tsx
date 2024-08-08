import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ActionTile, ActionTileList } from "../../../components/tile/ActionTile";

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
            <h1>What would you like to book?</h1>
            <ActionTileList listItems={listItems} />
        </div>
    )
};

export default BookingAreas;