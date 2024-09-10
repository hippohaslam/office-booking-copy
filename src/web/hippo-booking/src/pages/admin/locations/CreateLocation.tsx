import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { postNewLocationAsync } from "../../../services/Apis";
import { CtaButton, ErrorBanner } from "../../../components";
import { Link, useNavigate } from "react-router-dom";
import { NewLocation } from "../../../interfaces/Location";

const CreateLocation = () => {
  const initialLocation = {
    name: "",
    description: "",
    address: "",
    slackChannel: "",
    guideLink: ""
  };
  const navigate = useNavigate();
  const [location, setLocation] = useState<NewLocation>(initialLocation);

  const createLocation = useMutation({
    mutationFn: () => postNewLocationAsync(location),
    onSuccess: () => navigate("/admin"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createLocation.mutate();
  };

  const handleLocationUpdate = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocation({
      ...location,
      [e.target.name]: e.target.value,
    });
  };

  const hasErrors = createLocation.isError;

  return (
    <div>
      <div>
        <Link to='/admin'>Back to locations</Link>
        <div className='spacer'></div>
      </div>
      {hasErrors && <ErrorBanner isShown={hasErrors} title={"Error"} errorMessage={createLocation.error.message} allowClose={true} />}
      <h2>Create a new location</h2>
      <form onSubmit={handleSubmit}>
        <div className='standard-inputs'>
          <label htmlFor='location-name' title='The name of the location'>
            Name
          </label>
          <input type='text' name='name' value={location.name} onChange={handleLocationUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='description' title='The description of the location'>
            Description
          </label>
          <textarea name='description' value={location.description} onChange={handleLocationUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='address' title='The address of the location'>
            Address
          </label>
          <textarea id='address' name='address' value={location.address} onChange={handleLocationUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='slack-channel' title='The link to the Slack channel for the location'>
            Slack channel link
          </label>
          <input type="text" id='slack-channel' name='slackChannel' value={location.slackChannel} onChange={handleLocationUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='office-guide' title='The link to the Slack channel for the location'>
            Office guide link
          </label>
          <input type="text" id='office-guide' name='guideLink' value={location.guideLink} onChange={handleLocationUpdate} />
        </div>
        <br />
        <CtaButton text='Submit' type='submit' color='cta-green' />
      </form>
    </div>
  );
};

export default CreateLocation;
