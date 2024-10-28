import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs, CtaButton, ErrorBanner } from "../../../components";
import { getLocationAsync, postLocationAreaAsync } from "../../../services/Apis";
import { AreaTypeEnum } from "../../../enums/AreaTypeEnum.ts";
import { NewArea } from "../../../interfaces/Area";
import EnumSelect from "../../../components/select/EnumSelect.tsx";

const CreateArea = () => {
  const initialArea = {
    name: "",
    description: "",
    areaTypeId: AreaTypeEnum.Desks,
  };
  const navigate = useNavigate();
  const { locationId } = useParams();
  const [area, setArea] = useState<NewArea>(initialArea);

  const { data: locationData } = useQuery({
    queryKey: ["admin-location-new-area", locationId],
    queryFn: () => getLocationAsync(true)(locationId as string),
    enabled: !!locationId,
  });

  const createArea = useMutation({
    mutationFn: async () => postLocationAreaAsync(Number.parseInt(locationId as string), area),
    onSuccess: () => navigate("/admin"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createArea.mutate();
  };

  const handleAreaUpdate = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setArea({
      ...area,
      [e.target.name]: e.target.value,
    });
  };

  const handleAreaTypeUpdate = (e: any) => {
    setArea({
      ...area,
      ["areaTypeId"]: parseInt(e.target.value),
    });
  };

  const hasErrors = createArea.isError;
  const breadcrumbItems = [
    { to: "/admin", text: "Admin" },
    { to: "", text: "Create new area" },
  ];

  return (
    <div>
      {hasErrors && <ErrorBanner isShown={hasErrors} title='Error' errorMessage={createArea.error.message} allowClose={true} />}
      <Breadcrumbs items={breadcrumbItems} />
      <h1>Create a new area {locationData?.name}</h1>
      <form onSubmit={handleSubmit}>
        <div className='standard-inputs'>
          <label htmlFor='name'>Name</label>
          <input id='name' type='text' name='name' value={area.name} onChange={handleAreaUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='description'>Description</label>
          <textarea id='description' name='description' value={area.description} onChange={handleAreaUpdate} />
        </div>
        <div className='standard-inputs'>
          <label htmlFor='areaTypeId'>Area Type</label>
          <EnumSelect name='areaTypeId' value={area.areaTypeId.toString()} enumObj={AreaTypeEnum} onChange={handleAreaTypeUpdate} />
        </div>
        <CtaButton text='Submit' type='submit' color='cta-green' />
      </form>
    </div>
  );
};

export default CreateArea;
