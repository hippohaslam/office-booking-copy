import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorBanner, SuccessBanner } from "../../../../components";
import { getLocationAsync, postLocationAreaAsync } from "../../../../services/Apis";

const CreateArea = () => {
    const initialArea = {
        name: '',
        description: '',
    };
    const { locationId } = useParams();
    const [area, setArea] = useState<NewArea>(initialArea);

    const {data: locationData} = useQuery({
        queryKey: ["admin-location-new-area", locationId],
        queryFn: () => getLocationAsync(locationId as string),
        enabled: !!locationId,
    });

    const createArea = useMutation({
        mutationFn: async () => postLocationAreaAsync(Number.parseInt(locationId as string), area),
        onSuccess: () =>  setArea({name: '', description: ''}),
    });


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createArea.mutate();
    }

    const handleLocationUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArea({
            ...area,
            [e.target.name]: e.target.value,
        });
    }

    const hasErrors = createArea.isError;
    const hasSuccess = createArea.isSuccess;

    return (
        <div>
            <Link to="/admin">Back to locations</Link>
            <h2>Create a new area {locationData?.data?.name}</h2>
            {hasErrors && <ErrorBanner />}
            {hasSuccess && <SuccessBanner text="Saved successfully. Go back to see it in locations" />}
            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                        <tr>
                            <td><label htmlFor="name">Name</label></td>
                            <td>
                                <input type="text" name="name" value={area.name} onChange={handleLocationUpdate} />
                            </td>
                        </tr>
                        <tr>
                            <td><label htmlFor="description">Description</label></td>
                            <td>
                                <input type="text" name="description" value={area.description} onChange={handleLocationUpdate} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <br />
                <button>Submit</button>
            </form>
        </div>
    )
}

export default CreateArea;