import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const fetchOfficeAsync = async (officeId: string): Promise<Office> => {
  const response = await axios.get(`${baseUrl}/office/${officeId}`);
  return response.data;
}
  
const putOfficeAsync = async (office: Office) => {
  return await axios.put(`${baseUrl}/office/${office.id}`, office);
}

const putObjectsAsync = async (officeId: string, bookableObjects: BookableObject[]) => {
    return await Promise.all(
        bookableObjects.map((bookableObject) =>
            axios.put(`${baseUrl}/office/${officeId}/bookable-object/${bookableObject.id}`, bookableObject)
        )
      );
}

export {fetchOfficeAsync, putOfficeAsync, putObjectsAsync};