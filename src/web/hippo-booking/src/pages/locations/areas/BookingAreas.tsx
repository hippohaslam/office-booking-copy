import { Link,useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

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


    return (
        <div>
            <h3>Areas you can book</h3>
            {loaderData && loaderData.length > 1 && loaderData.map(area => (
                <div key={area.id}>
                    <Link to={`/locations/${locationId}/areas/${area.id}`}>{area.name}</Link>
                </div>
            ))}
        </div>
    )
};

export default BookingAreas;
