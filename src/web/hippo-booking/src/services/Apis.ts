import axios from 'axios';
import {Area, NewArea} from "../interfaces/Area";
import { BookingLocation, NewLocation } from '../interfaces/Location';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}`,
  withCredentials: true
});

const getLocationAsync = async (locationId: string): Promise<BookingLocation> => {
  const response = await axiosInstance.get(`/location/${locationId}`);
  return response.data;
}

const getLocationAreaAsync = async (locationId: string, areaId: string): Promise<Area> => {
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

const putAreaAsync = async (locationId: string, area: Area, areaId: string) => {
  return await axiosInstance.put(`/location/${locationId}/area/${areaId}`, area);
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

const postBookingAsync = async(newBooking: NewBooking): Promise<Booking> => {
  const response = await axiosInstance.post(`/booking`, newBooking);
  return response.data
}

const deleteBookingAsync = async(bookingId : number) => {
  return await axiosInstance.delete(`/booking/${bookingId}`);
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
  putObjectsAsync,
  // AREAS
  getLocationAreasAsync,
  postLocationAreaAsync,
  putAreaAsync, 
  // BOOKINGS
  getUpcomingBookingsAsync,
  getBookingsForDateAsync,
  postBookingAsync,
  deleteBookingAsync,
  // BookableObjects
  postBookableObjectAsync,
  // AUTH
  getSession,
  postSessionGoogle,
  signUserOut
};