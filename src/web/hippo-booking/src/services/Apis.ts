import axios from "axios";
import { Area, NewArea } from "../interfaces/Area";
import type { BookingLocation, NewLocation, EditLocation } from "../interfaces/Location";
import { BookableObject } from "../interfaces/Desk";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Intercepting 404 so we can redirect to a 404 page
      if (error.response.status === 404) {
        window.location.replace("/not-found");
      }
    }
    return Promise.reject(error);
  },
);

function prependAdminToUrl(url: string, admin: boolean) {
  return admin ? `/admin${url}` : url;
}

const getLocationAsync =
  (admin: boolean = false) =>
    async (locationId: string): Promise<BookingLocation> => {
      const url = prependAdminToUrl(`/location/${locationId}`, admin);
      const response = await axiosInstance.get(url);
      return response.data;
    };

const getLocationsAsync =
  (admin: boolean = false) =>
    async (): Promise<BookingLocation[]> => {
      const response = await axiosInstance.get(prependAdminToUrl(`/location`, admin));
      return response.data;
    };

const postNewLocationAsync = async (location: NewLocation) => {
  return await axiosInstance.post(prependAdminToUrl(`/location`, true), location);
};

const editLocationAsync = async (location: EditLocation) => {
  return await axiosInstance.put(prependAdminToUrl(`/location/${location.id}`, true), location);
}

const putObjectsAsync = async (locationId: string, areaId: string, bookableObjects: BookableObject[]) => {
  return await Promise.all(
    bookableObjects.map((bookableObject) =>
      axiosInstance.put(
        prependAdminToUrl(`/location/${locationId}/area/${areaId}/bookable-object/${bookableObject.id}`, true),
        bookableObject,
      ),
    ),
  );
};

// AREAS

const getLocationAreaAsync =
  (admin: boolean = false) =>
    async (locationId: string, areaId: string): Promise<Area> => {
      const response = await axiosInstance.get(prependAdminToUrl(`/location/${locationId}/area/${areaId}`, admin));
      return response.data;
    };

const postLocationAreaAsync = async (locationId: number, area: NewArea) => {
  return await axiosInstance.post(prependAdminToUrl(`/location/${locationId}/area`, true), area);
};

const putAreaAsync = async (locationId: string, area: Area, areaId: string) => {
  return await axiosInstance.put(prependAdminToUrl(`/location/${locationId}/area/${areaId}`, true), area);
};

/** Combines the locationId with the area data */
const getLocationAreasAsync =
  (admin: boolean = false) =>
    async (locationId: number): Promise<Area[]> => {
      const response = await axiosInstance.get(prependAdminToUrl(`/location/${locationId}/area`, admin));
      response.data.forEach((area: Area) => {
        area.locationId = locationId;
      });
      return response.data;
    };

// BOOKINGS

const getBookingAsync = async (bookingId: number): Promise<Booking> => {
  const response = await axiosInstance.get(`/booking/${bookingId}`);
  return response.data;
};

const getUpcomingBookingsAsync = async (): Promise<Booking[]> => {
  const response = await axiosInstance.get(`/booking/upcoming`);
  return response.data;
};

const getBookingsForDateAsync = async (locationId: number, areaId: number, date: Date): Promise<BookedObjects> => {
  const dateString = date.toISOString().split("T")[0];
  const response = await axiosInstance.get(`/booking/location/${locationId}/area/${areaId}/${dateString}`);
  return response.data;
};

const postBookingAsync = async (newBooking: NewBooking): Promise<Booking> => {
  const response = await axiosInstance.post(`/booking`, newBooking);
  return response.data;
};

const deleteBookingAsync = async (bookingId: number) => {
  return await axiosInstance.delete(`/booking/${bookingId}`);
};

// BookableObjects
/** Request to create a new bookable object  */
const postBookableObjectAsync = async (locationId: number, areaId: number, bookableObject: BookableObject) => {
  return await axiosInstance.post(prependAdminToUrl(`/location/${locationId}/area/${areaId}/bookable-object`, true), bookableObject);
};

// AUTH
const getSession = async () => {
  return await axiosInstance.get(`/session`);
};

const postSessionGoogle = async (bearerToken: string) => {
  return await axiosInstance.post(
    `/session/google`,
    {},
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
};

const signUserOut = async () => {
  return await axiosInstance.post(`/session/sign-out`, {});
};

// Reporting
const getReportListAsync = async (): Promise<ReportingList[]> => {
  const result = await axiosInstance.get("/reporting");
  return result.data;
}

const getReportDataAsync = async (reportId: string): Promise<ReportingParams> => {
  const result = await axiosInstance.get(`/reporting/${reportId}`);
  return result.data;
}

const runReportAsync = (reportId: string, params = {}) => {
  const data = axiosInstance.post(`/reporting/${reportId}/run`, params);
  return data;
}

export {
  // Locations
  getLocationAsync,
  postNewLocationAsync,
  getLocationAreaAsync,
  getLocationsAsync,
  putObjectsAsync,
  editLocationAsync,
  // AREAS
  getLocationAreasAsync,
  postLocationAreaAsync,
  putAreaAsync,
  // BOOKINGS
  getBookingAsync,
  getUpcomingBookingsAsync,
  getBookingsForDateAsync,
  postBookingAsync,
  deleteBookingAsync,
  // BookableObjects
  postBookableObjectAsync,
  // AUTH
  getSession,
  postSessionGoogle,
  signUserOut,
  // Reporting
  getReportDataAsync,
  getReportListAsync,
  runReportAsync
};
