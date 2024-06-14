import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const fetchLocationAsync = async (locationId: string): Promise<Location> => {
  const response = await axios.get(`${baseUrl}/location/${locationId}`);
  return response.data;
}
  
const putLocationAsync = async (location: Location) => {
  return await axios.put(`${baseUrl}/location/${location.id}`, location);
}

const putObjectsAsync = async (locationId: string, bookableObjects: BookableObject[]) => {
    return await Promise.all(
        bookableObjects.map((bookableObject) =>
            axios.put(`${baseUrl}/location/${locationId}/bookable-object/${bookableObject.id}`, bookableObject)
        )
      );
}

export {fetchLocationAsync, putLocationAsync, putObjectsAsync};