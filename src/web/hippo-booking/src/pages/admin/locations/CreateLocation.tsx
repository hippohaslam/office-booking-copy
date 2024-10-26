import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { postNewLocationAsync } from "../../../services/Apis";
import { Breadcrumbs, CtaButton, ErrorBanner } from "../../../components";
import { useNavigate } from "react-router-dom";
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
  const breadcrumbItems = [
    { to: "/admin", text: "Admin" }, 
    { to: "", text: "Create new location" }
  ];

  return (
    <div>
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <div className='spacer'></div>
      </div>
      {hasErrors && <ErrorBanner isShown={hasErrors} title={"Error"} errorMessage={createLocation.error.message} allowClose={true} />}
      <h1>Create a new location</h1>
      <form onSubmit={handleSubmit}>
        <div className='standard-inputs'>
          <label htmlFor='location-name' title='The name of the location'>
            Name
          </label>
          <input id="location-name" type='text' name='name' value={location.name} onChange={handleLocationUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='description' title='The description of the location'>
            Description
          </label>
          <textarea id="description" name='description' value={location.description} onChange={handleLocationUpdate} />
          <p className="hint">This will be shown on the locations list and details page.</p>
        </div>
        <div className='standard-inputs'>
          <label htmlFor='address' title='The address of the location'>
            Address
          </label>
          <textarea id='address' name='address' value={location.address} onChange={handleLocationUpdate} />
          <p className="hint">Full address including 'Hippo Digital', street address, town/city and postcode.</p>
        </div>
        <div className='standard-inputs'>
          <label htmlFor='slack-channel' title='The link to the Slack channel for the location'>
            Slack channel link
          </label>
          <input type="text" id='slack-channel' name='slackChannel' value={location.slackChannel} onChange={handleLocationUpdate} />
          <p className="hint">Right click on the channel name in Slack to get this link.</p>
        </div>
        <div className='standard-inputs'>
          <label htmlFor='office-guide' title='The link to the Slack channel for the location'>
            Office guide link
          </label>
          <input type="text" id='office-guide' name='guideLink' value={location.guideLink} onChange={handleLocationUpdate} />
          <p className="hint">The share link from the Google Drive file.</p>
        </div>
        <br/>
        <CtaButton text='Save location' type='submit' color='cta-green' />
      </form>
    </div>
  );
};

export default CreateLocation;
