import axios from 'axios';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}`,
  withCredentials: true
});

const getLocationAsync = async (locationId: string) => {
  return await axiosInstance.get(`/location/${locationId}`);
}

const getLocationAreaAsync = async (locationId: string, areaId: string): Promise<BookingLocation> => {
  const response = await axiosInstance.get(`/location/${locationId}/area/${areaId}`);
  return response.data;
}

const getLocationsAsync = async (): Promise<BookingLocation[]> => {
  const response = await axiosInstance.get(`/location`);
  return response.data;
}

const postNewLocationAsync = async (location: NewLocation) => {
  return await axiosInstance.post(`/location`, location);
}

const putLocationAsync = async (locationId: string, location: BookingLocation, areaId: string) => {
  return await axiosInstance.put(`/location/${locationId}/area/${areaId}`, location);
}

const putObjectsAsync = async (locationId: string, areaId: string, bookableObjects: BookableObject[]) => {
    return await Promise.all(
        bookableObjects.map((bookableObject) =>
            axiosInstance.put(`/location/${locationId}/area/${areaId}/bookable-object/${bookableObject.id}`, bookableObject)
        )
      );
}

// AREAS
const postLocationAreaAsync = async (locationId: number, area: NewArea) => {
  return await axiosInstance.post(`/location/${locationId}/area`, area);
}

/** Combines the locationId with the area data */ 
const getLocationAreasAsync = async (locationId: number): Promise<Area[]> => {
  const response = await axiosInstance.get(`/location/${locationId}/area`);
  response.data.forEach((area: Area) => {
    area.locationId = locationId;
  });
  return response.data;
}

// BOOKINGS

const getUpcomingBookingsAsync = async(): Promise<Booking[]> => {
  const response = await axiosInstance.get(`/booking/upcoming`);
  return response.data
}

const getBookingsForDateAsync = async(locationId: number, areaId: number, date: Date): Promise<BookedObjects> => {
  const dateString = date.toISOString().split('T')[0];
  const response = await axiosInstance.get(`/booking/location/${locationId}/area/${areaId}/${dateString}`);
  return response.data
}

// BookableObjects
/** Request to create a new bookable object  */
const postBookableObjectAsync = async (locationId: number, areaId: number, bookableObject: BookableObject) => {
  return await axiosInstance.post(`/location/${locationId}/area/${areaId}/bookable-object`, bookableObject);
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
  // Locations
  getLocationAsync,
  postNewLocationAsync,
  getLocationAreaAsync,
  getLocationsAsync, 
  putLocationAsync, 
  putObjectsAsync,
  // AREAS
  getLocationAreasAsync,
  postLocationAreaAsync,
  // BOOKINGS
  getUpcomingBookingsAsync,
  getBookingsForDateAsync,
  // BookableObjects
  postBookableObjectAsync,
  // AUTH
  getSession,
  postSessionGoogle,
  signUserOut
};