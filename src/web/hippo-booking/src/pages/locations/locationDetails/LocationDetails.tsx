import { Link, useParams } from "react-router-dom";
import { getLocationAsync } from "../../../services/Apis";
import { useQuery } from "@tanstack/react-query";
import { ErrorBanner, WarningBanner } from "../../../components";

const LocationDetails = () => {
    const { locationId } = useParams();

    const { isFetching, error, data } = useQuery({
        queryKey: ["location"],
        queryFn: () => getLocationAsync()(locationId!)
        });

        if (error) {
            return <ErrorBanner isShown={true} title="Error" errorMessage="Unable to get location, please refresh the page" allowClose={false} />;
        }
    
         if (isFetching) {
            return <div><span>Fetching location...</span></div>
        }

    return (
        <div>
            <WarningBanner isShown={true} title={"Page still under construction"} description="We're not quite finished building this page yet. Please check back soon."/>
            <h1>{data?.name}</h1>
            <h2>Description</h2>
            <p>{data?.description}</p>
            <Link className="cta cta-green with-arrow" to={"/locations/" + locationId + "/areas"}>Make a booking at {data?.name}</Link>
        </div>
    )
}

export default LocationDetails;