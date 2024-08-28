import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { editLocationAsync, getLocationAsync } from "../../../services/Apis";
import { CtaButton, ErrorBanner, SuccessBanner } from "../../../components";
import { Link, useParams } from "react-router-dom";
import type { EditLocation } from "../../../interfaces/Location";

const EditLocation = () => {
  const { locationId } = useParams();
  const [location, setLocation] = useState<EditLocation>();

  const { data, isSuccess } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationAsync(true)(locationId as string),
    enabled: !!locationId,
  });

  useEffect(() => {
    if (isSuccess) {
      setLocation(data);
    }
  }, [data]);

  const updateLocation = useMutation({
    mutationFn: () => {
      if (location) {
        return editLocationAsync(location);
      }
      return Promise.reject("Location is not defined");
    },
    onSuccess: () => console.log("Location updated successfully"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateLocation.mutate();
  };

  const handleLocationUpdate = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    if (location) {
      setLocation({
        ...location,
        [e.target.name]: e.target.value,
      });
    }
  };

  const hasErrors = updateLocation.isError;
  const hasSuccess = updateLocation.isSuccess;

  return (
    <div>
      <div>
        <Link to='/admin'>Back to locations</Link>
        <div className='spacer'></div>
      </div>
      {hasErrors && <ErrorBanner isShown={hasErrors} title={"Error"} errorMessage={updateLocation.error.message} allowClose={true} />}
      {hasSuccess && <SuccessBanner isShown={hasSuccess} title='Saved successfully' description='' />}

      <h2>Edit location</h2>
      <form onSubmit={handleSubmit}>
        <div className='standard-inputs'>
          <label htmlFor='location-name' title='The name of the location'>
            Name
          </label>
          <input type='text' name='name' value={location?.name} onChange={handleLocationUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='description' title='The description of the location'>
            Description
          </label>
          <textarea name='description' value={location?.description} onChange={handleLocationUpdate} />
        </div>
        <br />
        <CtaButton text='Submit' type='submit' color='cta-green' />
      </form>
    </div>
  );
};

export default EditLocation;
