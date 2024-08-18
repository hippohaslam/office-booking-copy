import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { postNewLocationAsync } from "../../../services/Apis";
import { ErrorBanner, SuccessBanner } from "../../../components";
import { Link } from "react-router-dom";
import { NewLocation } from "../../../interfaces/Location";

const CreateLocation = () => {
    const initialLocation = {
        name: '',
        description: '',
    }
    const [location, setLocation] = useState<NewLocation>(initialLocation);

    const createLocation = useMutation({
        mutationFn: async () => postNewLocationAsync(location),
        onSuccess: () =>  setLocation({name: '', description: ''}),
    });


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createLocation.mutate();
    }

    const handleLocationUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation({
            ...location,
            [e.target.name]: e.target.value,
        });
    }

    const hasErrors = createLocation.isError;
    const hasSuccess = createLocation.isSuccess;

    return (
        <div>
             {hasErrors && <ErrorBanner isShown={hasErrors} title={"Error"} errorMessage={createLocation.error.message} allowClose={true} />}
             {hasSuccess && <SuccessBanner isShown={hasSuccess} title="Saved successfully" description="Go back to see location." />}
            <Link to="/admin">Back to locations</Link>
            <h2>Create a new location</h2>
            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                        <tr>
                            <td><label htmlFor="name">Name</label></td>
                            <td>
                                <input type="text" name="name" value={location.name} onChange={handleLocationUpdate} />
                            </td>
                        </tr>
                        <tr>
                            <td><label htmlFor="description">Description</label></td>
                            <td>
                                <input type="text" name="description" value={location.description} onChange={handleLocationUpdate} />
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

export default CreateLocation;