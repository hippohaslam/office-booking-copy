import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorBanner, SuccessBanner } from "../../../../components";
import { getLocationAsync, postLocationAreaAsync } from "../../../../services/Apis";
import {AreaTypeEnum, AreaTypeEnumLabels} from "../../../../enums/AreaTypeEnum.ts";
import {NewArea} from "../../../../interfaces/Area";

const CreateArea = () => {
    const initialArea = {
        name: '',
        description: '',
        areaTypeId: AreaTypeEnum.Desks
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
        onSuccess: () =>  setArea({name: '', description: '', areaTypeId: AreaTypeEnum.Desks}),
    });


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        createArea.mutate();
    }

    const handleAreaUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArea({
            ...area,
            [e.target.name]: e.target.value,
        });
    }

    const handleAreaTypeUpdate = (e: any) => {
        setArea({
            ...area,
            ["areaTypeId"]: parseInt(e.target.value),
        });
    }

    const hasErrors = createArea.isError;
    const hasSuccess = createArea.isSuccess;

    return (
        <div>
            {hasErrors && <ErrorBanner isShown={hasErrors} title="Error" errorMessage={createArea.error.message} allowClose={true}/>}
            {hasSuccess && <SuccessBanner isShown={hasSuccess} title="Saved successfully" description="Go back to see it in locations" />}
            <Link to="/admin">Back to locations</Link>
            <h2>Create a new area {locationData?.name}</h2>
            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                    <tr>
                        <td><label htmlFor="name">Name</label></td>
                        <td>
                            <input type="text" name="name" value={area.name} onChange={handleAreaUpdate}/>
                        </td>
                    </tr>
                    <tr>
                        <td><label htmlFor="description">Description</label></td>
                        <td>
                            <input type="text" name="description" value={area.description}
                                   onChange={handleAreaUpdate}/>
                        </td>
                    </tr>
                    <tr>
                        <td><label htmlFor="areaTypeId">Area Type</label></td>
                        <td>
                            <select name="areaTypeId" value={area.areaTypeId} onChange={handleAreaTypeUpdate}>
                                {Object.keys(AreaTypeEnumLabels).map((key, _) => {
                                    return <option key={key} value={key}>{AreaTypeEnumLabels[key]}</option>
                                })}
                            </select>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <br/>
                <button>Submit</button>
            </form>
        </div>
    )
}

export default CreateArea;