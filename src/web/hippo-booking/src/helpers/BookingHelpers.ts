import { BookableObject } from "../interfaces/Desk";
import { isNullOrEmpty } from "./StringHelpers";

const filterWithFloorPlanObjectId = (bookableObjects: BookableObject[]): BookableObject[] => {
    return bookableObjects.filter((bookableObj) => !isNullOrEmpty(bookableObj.floorPlanObjectId));
};

const filterWithExistingBooking = (bookedObjects: BookedObject[]): BookedObject[] => {
    return bookedObjects.filter((bookedObj) => bookedObj.existingBooking);
};

export const getExistingBookingsFloorPlanIds = (bookableObjects: BookableObject[], bookedObjects: BookedObject[]): string[] => {
    const existingBookings = filterWithFloorPlanObjectId(bookableObjects).filter((obj) =>
        filterWithExistingBooking(bookedObjects).some((bookedObj) => bookedObj.id === obj.id),
    );
    return existingBookings.map((obj) => obj.floorPlanObjectId!);
};

export const getNonExistingBookingsFloorPlanIds = (bookableObjects: BookableObject[], bookedObjects: BookedObject[]): string[] => {
    const nonExistingBookings = filterWithFloorPlanObjectId(bookableObjects).filter(
        (obj) => !filterWithExistingBooking(bookedObjects).some((bookedObj) => bookedObj.id === obj.id),
    );
    return nonExistingBookings.map((obj) => obj.floorPlanObjectId!);
};

export const getNonBookableObjects = (bookableObjects: BookableObject[]): BookableObject[] => {
    return bookableObjects.filter((bookableObj) => isNullOrEmpty(bookableObj.floorPlanObjectId));
}