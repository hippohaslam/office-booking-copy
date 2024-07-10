import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

axios.defaults.withCredentials = true;

const getLocationAsync = async (locationId: string, areaId: string): Promise<Location> => {
  const response = await axios.get(`${baseUrl}/location/${locationId}/area/${areaId}`);
  return response.data;
}

const getLocationsAsync = async (): Promise<Location[]> => {
  const response = await axios.get(`${baseUrl}/location`);
  return response.data;
}
  
const putLocationAsync = async (location: Location, areaId: string) => {
  return await axios.put(`${baseUrl}/location/${location.id}/area/${areaId}`, location);
}

const putObjectsAsync = async (locationId: string, areaId: string, bookableObjects: BookableObject[]) => {
    return await Promise.all(
        bookableObjects.map((bookableObject) =>
            axios.put(`${baseUrl}/location/${locationId}/area/${areaId}/bookable-object/${bookableObject.id}`, bookableObject)
        )
      );
}

// AREAS

/** Combines the locationId with the area data */ 
const getLocationAreasAsync = async (locationId: string): Promise<Area[]> => {
  const response = await axios.get(`${baseUrl}/location/${locationId}/area`);
  response.data.forEach((area: Area) => {
    area.locationId = parseInt(locationId);
  });
  return response.data;
}

// AUTH
const getSession = async () => {
  return await axios.get('https://localhost:7249/session', {
    withCredentials: true
  })
}

const postSessionGoogle = async (bearerToken: string) => {
  return await axios.post('https://localhost:7249/session/google', {}, {
    headers:{
      Authorization: `Bearer ${bearerToken}`
    }
  });
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
  postSessionGoogle
};