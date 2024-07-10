import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}`,
  withCredentials: true
});

const getLocationAsync = async (locationId: string, areaId: string): Promise<Location> => {
  const response = await axiosInstance.get(`/location/${locationId}/area/${areaId}`);
  return response.data;
}

const getLocationsAsync = async (): Promise<Location[]> => {
  const response = await axiosInstance.get(`/location`);
  return response.data;
}
  
const putLocationAsync = async (location: Location, areaId: string) => {
  return await axiosInstance.put(`/location/${location.id}/area/${areaId}`, location);
}

const putObjectsAsync = async (locationId: string, areaId: string, bookableObjects: BookableObject[]) => {
    return await Promise.all(
        bookableObjects.map((bookableObject) =>
            axiosInstance.put(`/location/${locationId}/area/${areaId}/bookable-object/${bookableObject.id}`, bookableObject)
        )
      );
}

// AREAS

/** Combines the locationId with the area data */ 
const getLocationAreasAsync = async (locationId: number): Promise<Area[]> => {
  const response = await axiosInstance.get(`/location/${locationId}/area`);
  response.data.forEach((area: Area) => {
    area.locationId = locationId;
  });
  return response.data;
}

// AUTH
const getSession = async () => {
  return await axiosInstance.get(`/session`)
}

const postSessionGoogle = async (bearerToken: string) => {
  return await axiosInstance.post(`/session/google`, {}, {
    headers:{
      Authorization: `Bearer ${bearerToken}`
    }
  });
}

const signUserOut = async () => {
  return await axiosInstance.post(`/session/sign-out`, {});
}

export {
  getLocationAsync, 
  getLocationsAsync, 
  putLocationAsync, 
  putObjectsAsync,
  // AREAS
  getLocationAreasAsync,
  // AUTH
  getSession,
  postSessionGoogle,
  signUserOut
};